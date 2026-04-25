const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.xelio.me";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface MailRow {
  id: number;
  date: string;
  sender: string;
  recipients: string;
  data: string;
}

export interface ParsedMail {
  id: number;
  from: string;
  subject: string;
  body: string;
  isHtml: boolean;
  time: string;
  date: string;
}

export interface EmailAddress {
  address: string;
  created_at: string;
  email_count?: number;
}

export interface CreateEmailResponse {
  address: string;
  created_at: string;
}


function decodeQuotedPrintable(str: string): string {
  try {
    return str
      .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/=\r?\n/g, '');
  } catch (e) {
    return str;
  }
}

function parseEmailData(raw: string): { subject: string; body: string; isHtml: boolean } {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  let subject = "";
  let bodyStartIndex = 0;
  let inHeaders = true;
  let boundary = "";
  let isMultipart = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inHeaders) {
      if (line.toLowerCase().startsWith("subject:")) {
        subject = line.substring(8).trim();
      }
      if (line.toLowerCase().startsWith("content-type:") && line.includes("multipart/")) {
        isMultipart = true;
        const match = line.match(/boundary=["']?([^"';\s]+)["']?/i);
        if (match) boundary = match[1];
      }
      if (line.trim() === "") {
        inHeaders = false;
        bodyStartIndex = i + 1;
        break;
      }
    }
  }

  // Fallback for boundary spread across lines
  if (isMultipart && !boundary) {
    for (let i = 0; i < bodyStartIndex; i++) {
      const match = lines[i].match(/boundary=["']?([^"';\s]+)["']?/i);
      if (match) {
        boundary = match[1];
        break;
      }
    }
  }

  let body = lines.slice(bodyStartIndex).join("\n").trim();
  let isHtml = false;

  if (isMultipart && boundary) {
    const parts = body.split("--" + boundary);
    let htmlPart = "";
    let textPart = "";
    
    for (const part of parts) {
      if (!part || part.trim() === "" || part.trim() === "--") continue;
      
      const partLines = part.trimStart().split("\n");
      let partInHeaders = true;
      let partContentType = "text/plain";
      let isQuotedPrintable = false;
      let partBodyStart = 0;
      
      for (let j = 0; j < partLines.length; j++) {
        const pl = partLines[j];
        if (partInHeaders) {
          if (pl.toLowerCase().startsWith("content-type:")) {
            if (pl.includes("text/html")) partContentType = "text/html";
            else if (pl.includes("text/plain")) partContentType = "text/plain";
          }
          if (pl.toLowerCase().startsWith("content-transfer-encoding:") && pl.toLowerCase().includes("quoted-printable")) {
            isQuotedPrintable = true;
          }
          if (pl.trim() === "") {
            partInHeaders = false;
            partBodyStart = j + 1;
            break;
          }
        }
      }
      
      let partContent = partLines.slice(partBodyStart).join("\n").trim();
      if (isQuotedPrintable) {
        partContent = decodeQuotedPrintable(partContent);
      }
      
      if (partContentType === "text/html" && !htmlPart) {
        htmlPart = partContent;
      } else if (partContentType === "text/plain" && !textPart) {
        textPart = partContent;
      }
    }
    
    if (htmlPart) {
      body = htmlPart;
      isHtml = true;
    } else if (textPart) {
      body = textPart;
    }
  } else {
    // Check if whole email is html
    for (let i = 0; i < bodyStartIndex; i++) {
      if (lines[i].toLowerCase().startsWith("content-type:") && lines[i].includes("text/html")) {
        isHtml = true;
        break;
      }
    }
  }

  return { subject: subject || "No Subject", body, isHtml };
}


function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr.replace(" ", "T") + (dateStr.includes("Z") ? "" : "Z"));
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return dateStr;
  } catch {
    return dateStr;
  }
}

export async function fetchEmails(address: string): Promise<ParsedMail[]> {
  const res = await fetch(`${API_BASE}/api/emails/${encodeURIComponent(address)}`, {
    headers: { "Content-Type": "application/json" },
  });

  const json: ApiResponse<MailRow[]> = await res.json();

  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to fetch emails");
  }

  return json.data.map((mail) => {
    const { subject, body, isHtml } = parseEmailData(mail.data);
    return {
      id: mail.id,
      from: mail.sender,
      subject,
      body,
      isHtml,
      time: formatRelativeTime(mail.date),
      date: mail.date,
    };
  });
}

export async function fetchEmail(address: string, id: number): Promise<ParsedMail | null> {
  const res = await fetch(`${API_BASE}/api/emails/${encodeURIComponent(address)}/${id}`, {
    headers: { "Content-Type": "application/json" },
  });

  const json: ApiResponse<MailRow> = await res.json();

  if (!json.success || !json.data) {
    return null;
  }

  const { subject, body, isHtml } = parseEmailData(json.data.data);
  return {
    id: json.data.id,
    from: json.data.sender,
    subject,
    body,
    isHtml,
    time: formatRelativeTime(json.data.date),
    date: json.data.date,
  };
}

export async function deleteEmail(address: string, id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/emails/${encodeURIComponent(address)}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const json: ApiResponse<null> = await res.json();
  return json.success;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/`, { method: "GET" });
    const json: ApiResponse<string> = await res.json();
    return json.success;
  } catch {
    return false;
  }
}

export async function createEmailAddress(username: string): Promise<EmailAddress> {
  const res = await fetch(`${API_BASE}/api/emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  const json: ApiResponse<CreateEmailResponse> = await res.json();

  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to create email address");
  }

  return {
    address: json.data.address,
    created_at: json.data.created_at,
  };
}

export async function listEmailAddresses(): Promise<EmailAddress[]> {
  const res = await fetch(`${API_BASE}/api/emails`, {
    headers: { "Content-Type": "application/json" },
  });

  const json: ApiResponse<EmailAddress[]> = await res.json();

  if (!json.success || !json.data) {
    throw new Error(json.error || "Failed to list email addresses");
  }

  return json.data;
}

export async function deleteEmailAddress(address: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/emails/${encodeURIComponent(address)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const json: ApiResponse<{ message: string; address: string }> = await res.json();
  return json.success;
}

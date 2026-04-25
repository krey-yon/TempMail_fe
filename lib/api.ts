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

function parseEmailData(raw: string): { subject: string; body: string } {
  const lines = raw.split("\n");
  let subject = "";
  let bodyStartIndex = 0;
  let inHeaders = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (inHeaders) {
      if (line.toLowerCase().startsWith("subject:")) {
        subject = line.substring(8).trim();
      }
      if (line === "") {
        inHeaders = false;
        bodyStartIndex = i + 1;
      }
    }
  }

  const body = lines.slice(bodyStartIndex).join("\n").trim();

  return { subject: subject || "No Subject", body };
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr.replace(" ", "T"));
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
    const { subject, body } = parseEmailData(mail.data);
    return {
      id: mail.id,
      from: mail.sender,
      subject,
      body,
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

  const { subject, body } = parseEmailData(json.data.data);
  return {
    id: json.data.id,
    from: json.data.sender,
    subject,
    body,
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

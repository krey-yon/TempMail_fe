import PostalMime, { type Attachment } from "postal-mime";

export type Sender = { name: string | null; address: string };

export type MailBody = { kind: "html"; html: string } | { kind: "text"; text: string };

export type Mail = {
  id: string;
  receivedAt: number;
  from: Sender;
  subject: string | null;
  preview: string;
  body: MailBody;
};

export type MailRow = {
  id: string;
  date: string;
  sender: string;
  recipients: string;
  data: string;
};

const parsed = new Map<string, Promise<Mail>>();

export function parseMailRow(row: MailRow): Promise<Mail> {
  let mail = parsed.get(row.id);
  if (!mail) {
    mail = parse(row);
    parsed.set(row.id, mail);
  }
  return mail;
}

async function parse(row: MailRow): Promise<Mail> {
  const email = await PostalMime.parse(row.data, { attachmentEncoding: "base64" });
  const html = email.html ? inlineCidImages(email.html, email.attachments) : null;
  const text = email.text?.trim() ?? "";
  const from = email.from?.address
    ? { name: email.from.name.trim() || null, address: email.from.address }
    : { name: null, address: row.sender };

  return {
    id: row.id,
    receivedAt: parseServerDate(row.date) ?? parseServerDate(email.date ?? "") ?? Date.now(),
    from,
    subject: email.subject?.trim() || null,
    preview: collapse(text || (html ? htmlToText(html) : "")).slice(0, 160),
    body: html ? { kind: "html", html } : { kind: "text", text },
  };
}

function parseServerDate(value: string): number | null {
  const iso = value.includes("T") ? value : value.replace(" ", "T");
  const time = Date.parse(/Z|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(time) ? null : time;
}

function inlineCidImages(html: string, attachments: Attachment[]): string {
  const byCid = new Map<string, string>();
  for (const a of attachments) {
    if (a.contentId && typeof a.content === "string" && a.encoding === "base64") {
      byCid.set(a.contentId.replace(/^<|>$/g, ""), `data:${a.mimeType};base64,${a.content}`);
    }
  }
  if (byCid.size === 0) return html;
  return html.replace(/cid:([^"'\s)>]+)/gi, (match, cid: string) => byCid.get(cid) ?? match);
}

function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("head, style, script, title").forEach((node) => node.remove());
  return doc.body?.textContent ?? "";
}

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function senderLabel(sender: Sender): string {
  return sender.name ?? sender.address.split("@")[0];
}

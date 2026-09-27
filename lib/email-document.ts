const CSP = [
  "default-src 'none'",
  "img-src https: http: data:",
  "style-src 'unsafe-inline' https: http:",
  "font-src https: http: data:",
  "media-src https: http: data:",
  "form-action 'none'",
].join("; ");

// Every selector sits inside :where() so it has zero specificity and the email's own CSS always wins.
const RESET = `
:where(html) { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
:where(body) {
  margin: 0;
  padding: 24px 28px 40px;
  color: #1f1d1a;
  font: 15px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  overflow-wrap: break-word;
}
:where(img, video) { max-width: 100%; height: auto; }
:where(table) { max-width: 100%; }
:where(pre) { white-space: pre-wrap; }
:where(a) { color: #1f4bd8; }
:where(blockquote) { margin: 0 0 0 4px; padding-left: 12px; border-left: 3px solid #d8d3c8; color: #57524a; }
`;

const HEAD = `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${CSP}"><meta name="color-scheme" content="light only"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width, initial-scale=1"><base target="_blank"><style>${RESET}</style>`;

export function buildEmailDocument(html: string): string {
  const clean = html
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<meta[^>]+http-equiv=["']?refresh[^>]*>/gi, "")
    .replace(/<base\b[^>]*>/gi, "");

  if (/<head\b[^>]*>/i.test(clean)) return clean.replace(/<head\b[^>]*>/i, (tag) => tag + HEAD);
  if (/<html\b[^>]*>/i.test(clean)) return clean.replace(/<html\b[^>]*>/i, (tag) => `${tag}<head>${HEAD}</head>`);
  return `<!doctype html><html><head>${HEAD}</head><body>${clean}</body></html>`;
}

export type TextSegment = { kind: "text"; value: string } | { kind: "link"; value: string; href: string };

const LINK = /\bhttps?:\/\/[^\s<>"']+|\bwww\.[^\s<>"']+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gi;
const TRAILING = /[.,;:!?'")\]}>]+$/;

export function linkify(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const value = match[0].replace(TRAILING, "");
    const start = match.index;
    if (start > last) segments.push({ kind: "text", value: text.slice(last, start) });
    const href = value.includes("://") ? value : value.startsWith("www.") ? `https://${value}` : `mailto:${value}`;
    segments.push({ kind: "link", value, href });
    last = start + value.length;
  }
  if (last < text.length) segments.push({ kind: "text", value: text.slice(last) });
  return segments;
}

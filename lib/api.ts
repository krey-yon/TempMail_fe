import { parseMailRow, type Mail, type MailRow } from "@/lib/mail";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.xelio.me";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface Session {
  address: string;
  token: string;
  created_at: string;
}

export interface PublicStats {
  total_addresses_created: number;
}

interface CreateEmailApiResponse {
  address: string;
  created_at: string;
  access_token: string;
}

function authHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-mailbox-token": token,
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const json: ApiResponse<unknown> = await res.json();
      if (json.error) message = json.error;
    } catch {}
    throw new ApiError(res.status, message);
  }
  const json: ApiResponse<T> = await res.json();
  if (!json.success || json.data === null || json.data === undefined) {
    throw new ApiError(res.status, json.error || "Request failed");
  }
  return json.data;
}

export async function fetchStats(signal?: AbortSignal): Promise<PublicStats> {
  const res = await fetch(`${API_BASE}/api/stats`, { cache: "no-store", signal });
  const stats = await parseResponse<PublicStats>(res);
  if (!Number.isSafeInteger(stats.total_addresses_created) || stats.total_addresses_created < 0) {
    throw new ApiError(res.status, "Usage statistics unavailable");
  }
  return stats;
}

export async function fetchEmails(address: string, token: string): Promise<Mail[]> {
  const res = await fetch(`${API_BASE}/api/emails/${encodeURIComponent(address)}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  const rows = await parseResponse<MailRow[]>(res);
  const mails = await Promise.all(rows.map(parseMailRow));
  return mails.sort((a, b) => b.receivedAt - a.receivedAt);
}

export async function deleteEmail(address: string, token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/emails/${encodeURIComponent(address)}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await parseResponse<unknown>(res);
}

export async function createEmailAddress(username: string): Promise<Session> {
  const res = await fetch(`${API_BASE}/api/emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  const data = await parseResponse<CreateEmailApiResponse>(res);
  return {
    address: data.address,
    token: data.access_token,
    created_at: data.created_at,
  };
}

export async function deleteEmailAddress(address: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/emails/${encodeURIComponent(address)}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await parseResponse<unknown>(res);
}

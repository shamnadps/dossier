import type {
  Account,
  AccountDetail,
  Activity,
  ActivityType,
  AuthResponse,
} from "./types";

const BASE = import.meta.env.VITE_API_BASE ?? "";

const TOKEN_KEY = "dossier_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function req<T>(
  path: string,
  opts: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch {
      /* ignore */
    }
    if (res.status === 401) setToken(null);
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  signup: (email: string, password: string, name: string) =>
    req<AuthResponse>("/auth/signup", {
      method: "POST",
      body: { email, password, name },
      auth: false,
    }),

  login: (email: string, password: string) =>
    req<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),

  me: () => req<{ id: number; name: string; email: string }>("/auth/me"),

  listAccounts: (status?: string) =>
    req<Account[]>(`/accounts${status ? `?status=${status}` : ""}`),

  createAccount: (input: { name?: string; domain?: string }) =>
    req<Account>("/accounts", { method: "POST", body: input }),

  getAccount: (id: number) => req<AccountDetail>(`/accounts/${id}`),

  research: (id: number) =>
    req<AccountDetail>(`/accounts/${id}/research`, { method: "POST" }),

  updateAccountStatus: (id: number, status: string) =>
    req<Account>(`/accounts/${id}`, { method: "PATCH", body: { status } }),

  addActivity: (
    accountId: number,
    input: { type: ActivityType; body: string; due_at?: number | null },
  ) =>
    req<Activity>(`/accounts/${accountId}/activities`, {
      method: "POST",
      body: input,
    }),

  toggleActivity: (id: number, done: boolean) =>
    req<Activity>(`/activities/${id}`, { method: "PATCH", body: { done } }),
};

export { ApiError };

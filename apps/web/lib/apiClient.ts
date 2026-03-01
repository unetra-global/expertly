import { getBrowserClient } from './supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = getBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function refreshAndRetry<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.refreshSession();

  if (error) {
    // Refresh failed — send user to login
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth?returnTo=${returnTo}`;
    throw new Error('Session expired');
  }

  // Retry once with fresh token
  const newHeaders = await getAuthHeader();
  const retryResp = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      ...newHeaders,
    },
  });

  if (!retryResp.ok) {
    const errData = await retryResp.json().catch(() => ({}));
    throw new ApiError(retryResp.status, errData);
  }

  return retryResp.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: Record<string, unknown>,
  ) {
    super(
      (body?.error as Record<string, unknown>)?.message as string ||
        `API Error ${status}`,
    );
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const authHeaders = await getAuthHeader();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
  };

  const init: RequestInit = {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const resp = await fetch(`${API_BASE}${path}`, init);

  if (resp.status === 401) {
    return refreshAndRetry<T>(path, init);
  }

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({})) as Record<string, unknown>;
    throw new ApiError(resp.status, errData);
  }

  // 204 No Content
  if (resp.status === 204) return undefined as unknown as T;

  const json = await resp.json() as { success: boolean; data?: T; error?: unknown };

  // Unwrap envelope
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }

  return json as unknown as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

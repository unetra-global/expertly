import { getBrowserClient } from './supabase';
import type { AiSearchResponse } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

/**
 * Get the current session's access token.
 * The Supabase SDK manages token refresh automatically via autoRefreshToken —
 * no manual refresh logic needed here.
 */
async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = getBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const url = new URL(`${API_BASE}/api/v1${path}`);

  if (params) {
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  const authHeaders = await getAuthHeader();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
  };

  const resp = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  // 401 — session is gone or token is invalid; redirect to login.
  // The Supabase SDK keeps the token fresh via autoRefreshToken, so a 401
  // here means the session has genuinely expired and the user must sign in again.
  if (resp.status === 401) {
    const returnUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `/auth?returnTo=${returnUrl}`;
    throw new ApiError('SESSION_EXPIRED', 'Session expired', 401);
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as Record<string, unknown>;
    const errObj = err.error as Record<string, unknown> | undefined;
    throw new ApiError(
      String(errObj?.code ?? 'ERROR'),
      String(errObj?.message ?? 'Request failed'),
      resp.status,
    );
  }

  // 204 No Content
  if (resp.status === 204) return undefined as unknown as T;

  const json = await resp.json() as { data?: T; meta?: unknown };

  // Unwrap envelope — preserve { data, meta } for paginated responses
  if (json && typeof json === 'object' && 'data' in json) {
    if ('meta' in json) {
      const { data: d, meta } = json as { data: unknown; meta: unknown };
      return { data: d, meta } as unknown as T;
    }
    return json.data as T;
  }

  return json as unknown as T;
}

/**
 * Upload a file (multipart/form-data) with auth token attached.
 * Do NOT set Content-Type — the browser sets the correct multipart boundary.
 */
async function uploadFile<T>(path: string, form: FormData, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}/api/v1${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const authHeaders = await getAuthHeader();
  const resp = await fetch(url.toString(), {
    method: 'POST',
    headers: authHeaders, // NO Content-Type — let browser set multipart boundary
    body: form,
    credentials: 'include',
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as Record<string, unknown>;
    const errObj = err.error as Record<string, unknown> | undefined;
    throw new ApiError(
      String(errObj?.code ?? 'UPLOAD_FAILED'),
      String(errObj?.message ?? 'Upload failed'),
      resp.status,
    );
  }
  const json = await resp.json() as { data?: T };
  return (json.data ?? json) as T;
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>('GET', path, undefined, params),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, form: FormData, params?: Record<string, string>) =>
    uploadFile<T>(path, form, params),

  search: {
    ai: (query: string, scope?: 'members' | 'articles' | 'events' | 'all') =>
      request<AiSearchResponse>('POST', '/search/ai', { query, ...(scope ? { scope } : {}) }),
  },
};

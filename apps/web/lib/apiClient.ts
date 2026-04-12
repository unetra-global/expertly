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
 * Shared promise for the current getSession() call.
 * Multiple concurrent API calls (e.g. on dashboard mount) will share one
 * getSession() call instead of each firing their own.
 * Cleared after the microtask queue drains so the next distinct call starts fresh.
 */
let sessionPromise: Promise<string | null> | null = null;

/**
 * Shared promise for an in-flight token refresh.
 *
 * Root cause of the Supabase 429 refresh-token storm:
 * When an access token expires, all concurrent API requests receive 401 and
 * each independently calls supabase.auth.refreshSession(). At 10+ concurrent
 * requests that is 10+ simultaneous hits on POST /auth/v1/token — Supabase
 * rate-limits the burst and each 429 may trigger SDK-internal retries,
 * creating an exponential pile-up (observed: ~100 calls in 8 seconds).
 *
 * Fix: only ONE refreshSession() call is ever in-flight at a time.
 * Every concurrent 401 response awaits the same promise and retries with
 * the single fresh token it returns.
 */
let refreshPromise: Promise<string | null> | null = null;

async function getAuthHeader(): Promise<Record<string, string>> {
  if (!sessionPromise) {
    const supabase = getBrowserClient();
    sessionPromise = supabase.auth
      .getSession()
      .then(({ data }) => data.session?.access_token ?? null)
      .finally(() => {
        // Clear after current tick so the burst of concurrent calls shares this
        // promise, but the next independent call gets a fresh one.
        setTimeout(() => { sessionPromise = null; }, 0);
      });
  }

  const token = await sessionPromise;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Perform exactly one token refresh, shared across all concurrent callers.
 * Returns the new access token, or null if the refresh failed (session expired).
 */
function sharedRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    const supabase = getBrowserClient();
    refreshPromise = supabase.auth
      .refreshSession()
      .then(({ data: { session }, error }) => (error || !session ? null : session.access_token))
      .finally(() => {
        refreshPromise = null;
        // Clear the getSession cache so subsequent getAuthHeader() calls
        // pick up the freshly-issued token rather than the stale one.
        sessionPromise = null;
      });
  }
  return refreshPromise;
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

  // 401 — attempt one silent refresh (deduplicated across concurrent requests)
  if (resp.status === 401) {
    const newToken = await sharedRefresh();

    if (!newToken) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth?returnTo=${returnUrl}`;
      throw new ApiError('SESSION_EXPIRED', 'Session expired', 401);
    }

    // Retry once with fresh token
    const retryResp = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (!retryResp.ok) {
      const err = await retryResp.json().catch(() => ({})) as Record<string, unknown>;
      const errObj = err.error as Record<string, unknown> | undefined;
      throw new ApiError(
        String(errObj?.code ?? 'ERROR'),
        String(errObj?.message ?? 'Request failed'),
        retryResp.status,
      );
    }

    if (retryResp.status === 204) return undefined as unknown as T;
    const retryJson = await retryResp.json() as { data?: T; meta?: unknown };
    if ('data' in retryJson) {
      if ('meta' in retryJson) {
        const { data: d, meta } = retryJson as { data: unknown; meta: unknown };
        return { data: d, meta } as unknown as T;
      }
      return retryJson.data as T;
    }
    return retryJson as unknown as T;
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

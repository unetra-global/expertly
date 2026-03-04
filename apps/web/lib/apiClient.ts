import { getBrowserClient } from './supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = getBrowserClient();
  // getSession() triggers silent refresh if token expired
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
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

  // 401 — attempt one silent refresh
  if (resp.status === 401) {
    const supabase = getBrowserClient();
    const { data: { session: refreshed }, error } = await supabase.auth.refreshSession();

    if (error || !refreshed) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth?returnTo=${returnUrl}`;
      throw new ApiError('SESSION_EXPIRED', 'Session expired', 401);
    }

    // Retry once with fresh token
    const retryResp = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshed.access_token}`,
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
    const retryJson = await retryResp.json() as { data?: T };
    return ('data' in retryJson ? retryJson.data : retryJson) as T;
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

  const json = await resp.json() as { data?: T };

  // Unwrap envelope
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }

  return json as unknown as T;
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>('GET', path, undefined, params),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

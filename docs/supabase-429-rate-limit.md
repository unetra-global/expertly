# Supabase Auth 429 Rate Limit — Diagnosis & Fix

> **Symptom:** Supabase auth logs show a burst of `over_request_rate_limit` errors on
> `GET /auth/v1/user` and/or `POST /auth/v1/token?grant_type=refresh_token`,
> clustered within seconds of each other, with `user_agent: node` and `apikey: anon`.

---

## Quick-reference: the three root causes

| # | Where | What was happening | Fix applied |
|---|-------|--------------------|-------------|
| 1 | NestJS backend | `JwtAuthGuard` called `adminClient.auth.getUser(token)` on **every API request**, hitting `GET /auth/v1/user` over the network each time | In-memory cache (30 s TTL) in `apps/api/src/common/guards/jwt-auth.guard.ts` |
| 2 | Next.js server components | Middleware wrote refreshed tokens only to `response.cookies`, leaving `request.cookies` stale — every server component in the same render cycle saw the expired token and independently fired `POST /auth/v1/token?grant_type=refresh_token` | Middleware now writes to **both** `request.cookies` and `response.cookies`; `autoRefreshToken: false` on `createServerClient()` |
| 3 | Browser (client) | When the access token expired, every concurrent API call that received a 401 independently called `refreshSession()` in the same tick | `sharedRefresh()` deduplication promise in `apps/web/lib/apiClient.ts` |

---

## Root cause 1 — Backend: `getUser()` on every request

### What happens
Every API call goes through `JwtAuthGuard.canActivate()`, which called:
```typescript
await this.supabase.adminClient.auth.getUser(token);
```
This is a **synchronous network call to `GET /auth/v1/user`** every single time, even for the same user making 20 rapid requests (e.g. dashboard loading multiple widgets in parallel).

### Where to look
`apps/api/src/common/guards/jwt-auth.guard.ts`

### The fix
Module-level in-memory cache keyed by the raw JWT string:
```typescript
const AUTH_CACHE_TTL_MS = 30_000;   // 30 seconds
const AUTH_CACHE_MAX_SIZE = 2_000;
const authCache = new Map<string, { user: AuthUser; expiresAt: number }>();

// In canActivate(), before calling getUser():
const cached = authCache.get(token);
if (cached && cached.expiresAt > Date.now()) {
  request.user = cached.user;
  return true;
}

// After successful validation:
authCache.set(token, { user: authUser, expiresAt: Date.now() + AUTH_CACHE_TTL_MS });
```

**Trade-off:** A revoked token can pass for up to 30 s. Acceptable for this application.

---

## Root cause 2 — Server components: refresh storm from `request.cookies` being stale

### What happens
This is the **primary** cause of the `user_agent: node` burst in auth logs.

Next.js App Router render cycle:
1. **Middleware** runs first
2. **Server components** (layouts → pages → Navbar) run after, reading from `request.cookies`

`@supabase/ssr`'s `createServerClient` in middleware refreshes an expired access token and writes the new token to cookies. The old code wrote it **only to `response.cookies`**:

```typescript
// OLD — broken
set(name, value, options) {
  response.cookies.set({ name, value, ...options });   // ← only response
}
```

`request.cookies` still held the **stale expired token**. Every downstream server component created its own `createServerClient()`, called `getSession()`, saw the expired token, and — because `autoRefreshToken` was `true` (the default) — each independently fired `POST /auth/v1/token?grant_type=refresh_token`.

With 8–10 server components per page load, that's 8–10 simultaneous refresh calls, all from Node.js, all in under a second.

### Where to look
- `apps/web/middleware.ts` — the cookie `set()`/`remove()` callbacks
- `apps/web/lib/supabase-server.ts` — the `auth` options on `createServerClient()`

### The fix (two parts)

**Part A — middleware writes to both:**
```typescript
import { type CookieOptions, createServerClient } from '@supabase/ssr';

// In the cookies callbacks:
set(name: string, value: string, options: CookieOptions) {
  request.cookies.set({ name, value, ...options });   // ← server components read this
  response.cookies.set({ name, value, ...options });  // ← browser receives this
},
remove(name: string, options: CookieOptions) {
  request.cookies.set({ name, value: '', ...options });
  response.cookies.set({ name, value: '', ...options });
},
```

Also pass `request.headers` to `NextResponse.next()`:
```typescript
const response = NextResponse.next({ request: { headers: request.headers } });
```

**Part B — server components never auto-refresh:**
```typescript
// apps/web/lib/supabase-server.ts
return _createServerClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,  // ← THE critical flag; prevents refresh storms
    // DO NOT add persistSession: false — it breaks getSession() (see warning below)
  },
  cookies: {
    get(name) { return cookieStore.get(name)?.value; },
    set() {},     // no-op — server components must not write cookies
    remove() {},  // no-op
  },
});
```

### ⚠️ Warning: do NOT add `persistSession: false`

This flag was added in an earlier attempt and **broke the Navbar and all layouts**.

When `persistSession: false` is set, the Supabase JS client **skips loading the session from cookie storage on initialization**. The in-memory session is null from the start. `getSession()` reads from the in-memory session — so it always returns null, even though valid session cookies are present.

Symptoms:
- Navbar shows logged-out state for authenticated users
- Protected layouts redirect authenticated users to `/auth`
- `isMember` / `isAuthenticated` checks in page components always evaluate to `false`

The no-op `set()` and `remove()` cookie callbacks already prevent the server from writing cookies. `persistSession: false` is redundant and harmful.

**`autoRefreshToken: false` alone is sufficient** to prevent the 429 storm.

---

## Root cause 3 — Browser: concurrent 401s each triggering their own refresh

### What happens
When the access token expires in the browser, multiple API calls resolve to 401 in the same tick. The original code called `refreshSession()` inside the 401 handler of the `request()` function — so 10 concurrent API calls = 10 concurrent `POST /auth/v1/token` calls.

### Where to look
`apps/web/lib/apiClient.ts`

### The fix
A shared promise that deduplicates the refresh:
```typescript
let refreshPromise: Promise<string | null> | null = null;
let sessionPromise: Promise<string | null> | null = null;

function sharedRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    const supabase = getBrowserClient();
    refreshPromise = supabase.auth
      .refreshSession()
      .then(({ data: { session }, error }) => (error || !session ? null : session.access_token))
      .finally(() => {
        refreshPromise = null;
        sessionPromise = null;  // clear stale session cache
      });
  }
  return refreshPromise;
}

// In the 401 handler:
const newToken = await sharedRefresh();
```

---

## How to diagnose if the 429 comes back

1. **Open Supabase dashboard → Logs → Auth logs**
2. Look for `over_request_rate_limit` entries clustered within a few seconds
3. Expand a log entry and check:

| Field | Value | Indicates |
|-------|-------|-----------|
| `user_agent` | `node` | Calls are from Next.js server side (not browser) |
| `user_agent` | browser UA | Calls are from the client (browser) |
| `path` | `/auth/v1/user` | Root cause 1 (backend guard) or `getUser()` in server component |
| `path` | `/auth/v1/token` | Root cause 2 (server component refresh) or root cause 3 (browser burst) |
| `apikey` | `anon` | Client-side anon key — Next.js frontend |
| `apikey` | `service_role` | Backend NestJS — unexpected on these endpoints |

**If `user_agent: node` + `/auth/v1/token`:** Root cause 2 (middleware or `autoRefreshToken` regression)
**If `user_agent: node` + `/auth/v1/user`:** Root cause 1 (backend cache miss or regression)
**If browser UA + `/auth/v1/token`:** Root cause 3 (client-side refresh deduplication regression)

---

## Files changed (commit `7b306ad` + `fc5b155`)

```
apps/api/src/common/guards/jwt-auth.guard.ts   ← auth cache (root cause 1)
apps/web/middleware.ts                          ← dual cookie write + /onboarding + /application (root cause 2)
apps/web/lib/supabase-server.ts                ← autoRefreshToken:false only (root cause 2)
apps/web/lib/apiClient.ts                      ← sharedRefresh() + sessionPromise (root cause 3)
apps/web/app/(member)/layout.tsx               ← getSession() instead of getUser()
apps/web/app/(ops)/layout.tsx                  ← getSession() instead of getUser()
apps/web/app/(ops)/ops/layout.tsx              ← getSession() instead of getUser()
apps/web/app/(platform)/application/layout.tsx ← getSession() instead of getUser()
apps/web/app/(platform)/articles/[slug]/page.tsx ← getSession() instead of getUser()
apps/web/app/(platform)/articles/page.tsx      ← getSession() instead of getUser()
apps/web/app/(platform)/members/page.tsx       ← getSession() instead of getUser()
apps/web/app/onboarding/page.tsx               ← collapsed double auth call to single getSession()
apps/web/components/layout/Navbar.tsx          ← getSession() instead of getUser()
apps/web/hooks/useAuth.ts                      ← useUser() hook uses getSession() internally
```

---

## Rule of thumb going forward

| Context | Method to use | Reason |
|---------|--------------|--------|
| Next.js middleware | `supabase.auth.getUser()` | Must validate token — this IS the gatekeeper |
| Next.js server components / layouts | `supabase.auth.getSession()` | Reads from cookies, no network call; middleware already validated |
| Route handlers (`/api/...`) | `supabase.auth.getUser()` | Route handlers are their own entry point, not under middleware |
| Browser client components (hooks) | `supabase.auth.getSession()` | Reads from localStorage, no network call |
| Browser `apiClient.ts` 401 retry | `sharedRefresh()` | Deduplicates concurrent refresh calls |
| NestJS backend guard | Cache → `adminClient.auth.getUser()` on miss | Network call, but cached 30 s |

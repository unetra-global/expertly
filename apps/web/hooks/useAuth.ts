'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserClient();

    // getSession() reads from local storage — no Supabase network call on mount.
    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        // TOKEN_REFRESH_FAILED means the stored refresh token is invalid.
        // signOut() clears it from cookies so the auto-refresh loop stops.
        if (event === 'TOKEN_REFRESH_FAILED') {
          void supabase.auth.signOut();
        }
        setUser(session?.user ?? null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserClient();

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'TOKEN_REFRESH_FAILED') {
          void supabase.auth.signOut();
        }
        setSession(session);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, loading };
}

export function useSignOut() {
  const router = useRouter();

  return async () => {
    const supabase = getBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export interface AuthUser {
  id: string;
  username: string | null;
  email: string;
  is_admin?: boolean;
  is_active?: boolean;
  onboarding_completed?: boolean;
  total_xp?: number;
  timezone?: string;
  cybersecurity_experience?: string | null;
  created_at?: string;
  last_login?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (session: Session | null) => {
    if (!session) {
      setUserState(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/users/me');
      setUserState(res.data.user);
    } catch {
      setUserState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) loadProfile(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) loadProfile(session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUserState(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      logout,
      isAdmin: user?.is_admin ?? false,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

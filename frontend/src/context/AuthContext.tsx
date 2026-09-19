import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth as useClerkAuth, useClerk } from '@clerk/react';
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
  const { isLoaded, isSignedIn, userId } = useClerkAuth();
  const clerk = useClerk();
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [profileResolved, setProfileResolved] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setUserState(null);
      setProfileResolved(true);
      return;
    }
    let cancelled = false;
    setProfileResolved(false);
    api
      .get('/users/me')
      .then((res) => {
        if (!cancelled) setUserState(res.data.user);
      })
      .catch(() => {
        if (!cancelled) setUserState(null);
      })
      .finally(() => {
        if (!cancelled) setProfileResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId]);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
  };

  const logout = async () => {
    await clerk.signOut();
    setUserState(null);
  };

  const loading = !isLoaded || (isSignedIn === true && !profileResolved);

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

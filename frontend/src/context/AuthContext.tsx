import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface AuthUser {
  id: number;
  username: string | null;
  email: string;
  is_admin?: boolean;
  onboarding_completed?: boolean;
  created_at?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  isAdmin: boolean;
}

const STORAGE_KEY = 'cyberquest_user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUserState(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && user.onboarding_completed === false && window.location.pathname !== '/onboarding') {
      window.location.href = '/onboarding';
    }
  }, [user]);

  const setUser = (u: AuthUser | null) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
    setUserState(u);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
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

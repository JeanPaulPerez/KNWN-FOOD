import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface User {
  name: string;
  email: string;
  phone: string;
  zip: string;
  street?: string;
  city?: string;
  state?: string;
  wcCustomerId?: number;
}

interface UserContextValue {
  user: User | null;
  isRegistered: boolean;
  isHydrating: boolean;
  register: (userData: User) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
}

const STORAGE_KEY = 'knwn_user';
const UserContext = createContext<UserContextValue | undefined>(undefined);

function loadUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUserFromStorage);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/account-session', {
        credentials: 'include',
      });

      if (!res.ok) {
        setUser(null);
        return null;
      }

      const data = await res.json();
      setUser(data.user ?? null);
      return data.user ?? null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsHydrating(false);
    }
  }, []);

  useEffect(() => {
    refreshSession().catch(() => setIsHydrating(false));
  }, [refreshSession]);

  const register = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...userData } : current));
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/account-session', {
        method: 'DELETE',
        credentials: 'include',
      });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isRegistered: !!user,
      isHydrating,
      register,
      updateUser,
      logout,
      refreshSession,
    }),
    [isHydrating, logout, refreshSession, register, updateUser, user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}

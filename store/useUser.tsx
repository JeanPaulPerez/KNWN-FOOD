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
  token: string | null;
  register: (userData: User & { _token?: string }) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
}

const STORAGE_KEY = 'knwn_user';
const TOKEN_KEY   = 'knwn_token';
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

function loadTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUserFromStorage);
  const [token, setToken] = useState<string | null>(loadTokenFromStorage);
  const [isHydrating, setIsHydrating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const refreshSession = useCallback(async () => {
    setIsHydrating(false);
    return user;
  }, [user]);

  useEffect(() => {
    setIsHydrating(false);
  }, [refreshSession]);

  const register = useCallback((userData: User & { _token?: string }) => {
    const { _token, ...userOnly } = userData;
    setUser(userOnly);
    if (_token) {
      setToken(_token);
      window.localStorage.setItem(TOKEN_KEY, _token);
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...userData } : current));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(TOKEN_KEY);
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isRegistered: !!user,
      isHydrating,
      token,
      register,
      updateUser,
      logout,
      refreshSession,
    }),
    [isHydrating, logout, refreshSession, register, token, updateUser, user]
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

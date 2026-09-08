'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { adminApi } from '@/app/admin/_lib/admin-api';
import { clearStoredUser, getStoredUser, setStoredUser } from '@/app/admin/_lib/session';
import type { AdminUser, AuthResponse, LoginCredentials } from '@/app/admin/_lib/types';

interface AuthContextValue {
  user: AdminUser | null;
  ready: boolean;
  login: (credentials: LoginCredentials) => Promise<AdminUser>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<AdminUser | null>;
  hasPermission: (code: string) => boolean;
  hasModule: (moduleName: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const storeUser = useCallback((nextUser: AdminUser | null) => {
    setUser(nextUser);
    setStoredUser(nextUser);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await adminApi.post<AuthResponse>(
        '/admin/auth/login-staff',
        credentials,
      );
      storeUser(response.user);
      setReady(true);
      return response.user;
    },
    [storeUser],
  );

  const logout = useCallback(async () => {
    try {
      await adminApi.post('/admin/auth/logout');
    } catch {
    } finally {
      clearStoredUser();
      setUser(null);
      setReady(true);
    }
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const response = await adminApi.get<AuthResponse>('/admin/auth/me');
      storeUser(response.user);
      return response.user;
    } catch {
      storeUser(null);
      return null;
    } finally {
      setReady(true);
    }
  }, [storeUser]);

  const permissions = useMemo(
    () => new Set((user?.permissions ?? []).map((code) => code.toUpperCase())),
    [user],
  );
  const modules = useMemo(
    () => new Set((user?.modules ?? []).map((module) => module.toLowerCase())),
    [user],
  );

  const hasPermission = useCallback(
    (code: string) =>
      user?.type?.toLowerCase() === 'admin' || permissions.has(code.toUpperCase()),
    [permissions, user?.type],
  );
  const hasModule = useCallback(
    (moduleName: string) =>
      user?.type?.toLowerCase() === 'admin' || modules.has(moduleName.toLowerCase()),
    [modules, user?.type],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login,
      logout,
      refreshMe,
      hasPermission,
      hasModule,
    }),
    [user, ready, login, logout, refreshMe, hasPermission, hasModule],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used inside AuthProvider');
  }
  return context;
}

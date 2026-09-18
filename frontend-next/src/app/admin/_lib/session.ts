import type { AdminUser } from './types';

const STORAGE_KEY = 'core_admin_user';

export function getStoredUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as AdminUser) : null;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setStoredUser(user: AdminUser | null): void {
  if (typeof window === 'undefined') return;

  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function clearStoredUser(): void {
  setStoredUser(null);
}

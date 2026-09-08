import { env } from '@/lib/env';
import { clearStoredUser } from './session';
import type { ApiEnvelope } from './types';
import { adminRoutes } from '@/config/routes';

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

const REFRESH_PATH = '/admin/auth/refresh';
const AUTH_BYPASS_PATHS = [
  '/admin/auth/login',
  '/admin/auth/login-staff',
  REFRESH_PATH,
];

let refreshRequest: Promise<boolean> | null = null;

function endpoint(path: string): string {
  return `${env.apiUrl}/${path.replace(/^\//, '')}`;
}

function shouldBypassRefresh(path: string): boolean {
  return AUTH_BYPASS_PATHS.some((item) => path.includes(item));
}

async function parsePayload<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | T
    | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String(payload.message)
        : `API request failed (${response.status})`;

    throw new AdminApiError(message, response.status, payload);
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}

async function refreshSession(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = fetch(endpoint(REFRESH_PATH), {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

function expireSession(): void {
  clearStoredUser();
  if (
    typeof window !== 'undefined' &&
    !window.location.pathname.startsWith(adminRoutes.login)
  ) {
    window.location.assign(adminRoutes.login);
  }
}

export async function adminApiFetch<T>(
  path: string,
  init: RequestInit = {},
  retryAfterRefresh = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint(path), {
    ...init,
    headers,
    credentials: 'include',
  });

  if (
    response.status === 401 &&
    retryAfterRefresh &&
    !shouldBypassRefresh(path)
  ) {
    const refreshed = await refreshSession();
    if (refreshed) return adminApiFetch<T>(path, init, false);
    expireSession();
  }

  return parsePayload<T>(response);
}

export const adminApi = {
  get<T>(path: string) {
    return adminApiFetch<T>(path);
  },
  post<T>(path: string, body?: unknown) {
    return adminApiFetch<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  put<T>(path: string, body: unknown) {
    return adminApiFetch<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  patch<T>(path: string, body: unknown) {
    return adminApiFetch<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  delete<T>(path: string) {
    return adminApiFetch<T>(path, { method: 'DELETE' });
  },
};

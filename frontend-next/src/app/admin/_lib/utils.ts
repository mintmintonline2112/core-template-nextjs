import { env } from '@/lib/env';

export { cn } from '@/utils/cn';

export function getErrorMessage(err: unknown, fallback = 'Đã có lỗi xảy ra'): string {
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as Record<string, unknown>;
    const payload = anyErr.payload as Record<string, unknown> | undefined;
    const fromPayload = payload?.message;
    if (fromPayload) {
      return Array.isArray(fromPayload) ? fromPayload.join(', ') : String(fromPayload);
    }
    if (anyErr.message) return String(anyErr.message);
  }
  return fallback;
}

export function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  // /images/... là file tĩnh trong frontend-next/public (logo mặc định) — lấy từ site
  if (path.startsWith('/images/')) return `${env.siteUrl}${path}`;
  const origin = env.apiUrl.replace(/\/api$/, '');
  return `${origin}/${path.replace(/^\//, '')}`;
}

import { adminApi, adminApiFetch } from '@/admin/core/admin-api';
import type { PaginatedResponse } from './pagination';

export type CrudPayload = Record<string, unknown> | FormData;

/**
 * CRUD service dùng chung cho các endpoint kế thừa BaseController của backend
 * (GET /, GET /:id, POST /, PUT /:id, DELETE /:id, PATCH sort/:id).
 * Hỗ trợ cả JSON lẫn FormData (upload file).
 */
export function createCrudService<T>(
  endpoint: string,
  defaultOrderBy: Array<Record<string, 'ASC' | 'DESC'>> = [{ createdAt: 'DESC' }],
) {
  function send<R>(method: 'POST' | 'PUT', path: string, payload: CrudPayload): Promise<R> {
    if (payload instanceof FormData) {
      return adminApiFetch<R>(path, { method, body: payload });
    }
    return adminApiFetch<R>(path, { method, body: JSON.stringify(payload) });
  }

  return {
    paginate(params: Record<string, unknown>): Promise<PaginatedResponse<T>> {
      const qs = new URLSearchParams();
      const merged = { orderBy: JSON.stringify(defaultOrderBy), ...params };
      for (const [key, value] of Object.entries(merged)) {
        if (value === undefined || value === null || value === '') continue;
        qs.set(key, String(value));
      }
      return adminApi.get<PaginatedResponse<T>>(`${endpoint}?${qs.toString()}`);
    },

    getById(id: number | string): Promise<T> {
      return adminApi.get<T>(`${endpoint}/${id}`);
    },

    add(payload: CrudPayload): Promise<T> {
      return send<T>('POST', endpoint, payload);
    },

    edit(id: number | string, payload: CrudPayload): Promise<T> {
      return send<T>('PUT', `${endpoint}/${id}`, payload);
    },

    remove(id: number | string): Promise<{ id: number | string }> {
      return adminApi.delete<{ id: number | string }>(`${endpoint}/${id}`);
    },

    sort(id: number | string, sortValue: number): Promise<T> {
      return adminApi.patch<T>(`${endpoint}/sort/${id}`, { sort: sortValue });
    },
  };
}

export function buildPayload(
  values: Record<string, unknown>,
  options: { keepNull?: string[] } = {},
): CrudPayload {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === '') continue;
    if (value === null && !options.keepNull?.includes(key)) continue;
    payload[key] = value;
  }

  const hasFile = Object.values(payload).some((v) => v instanceof File);
  if (!hasFile) return payload;

  const fd = new FormData();
  // File ảnh đã qua hộp thoại nén trong form → backend tôn trọng, không nén lại
  fd.append('imageOptimize', 'skip');
  for (const [key, value] of Object.entries(payload)) {
    if (value instanceof File) fd.append(key, value);
    else if (value === null) continue;
    else if (typeof value === 'object') fd.append(key, JSON.stringify(value));
    else fd.append(key, String(value));
  }
  return fd;
}

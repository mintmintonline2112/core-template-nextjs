import { adminApiFetch, adminApi } from './admin-api';
import { env } from '@/lib/env';

export const LIBRARY_QUERY_KEY = ['admin', 'library'] as const;

export type LibraryKind = 'image' | 'video';

export interface LibraryImage {
  /** id trong bảng `media` — dùng để sửa alt. */
  id: number;
  kind: LibraryKind;
  name: string;
  path: string;
  url: string;
  folder: string;
  extension: string;
  size: number;
  /** Kích thước ảnh lấy sẵn từ DB (video để null). */
  width: number | null;
  height: number | null;
  /** Mô tả ảnh cho SEO / trình đọc màn hình. */
  alt: string | null;
  modifiedAt: string;
}

/** Một nơi đang dùng file — hiện trong hộp thoại xác nhận trước khi xoá. */
export interface MediaUsage {
  type: string;
  title: string;
  count: number;
}

export interface LibraryVideo {
  name: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface LibraryResponse {
  data: LibraryImage[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  folders: string[];
  totalSize: number;
}

export interface LibraryQuery {
  page?: number;
  limit?: number;
  search?: string;
  folder?: string;
  /** image | video | all (mặc định all) */
  type?: LibraryKind | 'all';
}

const ENDPOINT = 'admin/library';

function toQueryString(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    qs.set(key, String(value));
  }
  const query = qs.toString();
  return query ? `?${query}` : '';
}

export const libraryService = {
  list(params: LibraryQuery): Promise<LibraryResponse> {
    return adminApi.get<LibraryResponse>(
      `${ENDPOINT}${toQueryString(params as Record<string, unknown>)}`,
    );
  },

  upload(file: File, folder?: string): Promise<LibraryImage> {
    const fd = new FormData();
    fd.append('file', file);
    if (folder) fd.append('folder', folder);
    // Ảnh đã qua hộp thoại nén (hoặc đủ nhẹ) → backend không nén đè lựa chọn người dùng
    fd.append('imageOptimize', 'skip');
    return adminApiFetch<LibraryImage>(`${ENDPOINT}/upload`, {
      method: 'POST',
      body: fd,
    });
  },

  /** Video lớn → dùng XHR để có tiến trình upload (fetch không báo %). */
  uploadVideo(file: File, onProgress?: (percent: number) => void): Promise<LibraryVideo> {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${env.apiUrl}/${ENDPOINT}/upload-video`);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        let body: unknown = null;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          body = null;
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = body && typeof body === 'object' && 'data' in body ? (body as { data: LibraryVideo }).data : body;
          resolve(data as LibraryVideo);
          return;
        }
        const message =
          body && typeof body === 'object' && 'message' in body
            ? String((body as { message: unknown }).message)
            : xhr.status === 413
              ? 'Video vượt giới hạn dung lượng của máy chủ'
              : `Tải video thất bại (${xhr.status})`;
        reject(new Error(message));
      };
      xhr.onerror = () => reject(new Error('Không thể kết nối máy chủ khi tải video'));
      xhr.send(fd);
    });
  },

  /** Quét lại uploads/ để bắt file thêm/xoá bằng FTP. */
  sync(): Promise<{ added: number; removed: number; updated: number }> {
    return adminApi.post<{ added: number; removed: number; updated: number }>(
      `${ENDPOINT}/sync`,
    );
  },

  /** Liệt kê nội dung đang tham chiếu tới file (gọi trước khi xoá). */
  usage(path: string): Promise<MediaUsage[]> {
    return adminApi.get<MediaUsage[]>(`${ENDPOINT}/usage${toQueryString({ path })}`);
  },

  updateAlt(id: number, alt: string): Promise<LibraryImage> {
    return adminApi.patch<LibraryImage>(`${ENDPOINT}/${id}`, { alt });
  },

  remove(path: string): Promise<{ deleted: boolean }> {
    return adminApi.delete<{ deleted: boolean }>(
      `${ENDPOINT}${toQueryString({ path })}`,
    );
  },
};

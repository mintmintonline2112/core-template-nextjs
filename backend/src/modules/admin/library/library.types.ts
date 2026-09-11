import type { MediaKind } from './media.entity';

export type LibraryKind = MediaKind;

export interface LibraryVideo {
  name: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

/** Một file trong thư viện, đã kèm dữ liệu từ bảng `media`. */
export interface LibraryImage {
  id: number;
  kind: LibraryKind;
  name: string;
  path: string;
  url: string;
  folder: string;
  extension: string;
  size: number;
  /** Chỉ có với ảnh. */
  width: number | null;
  height: number | null;
  /** Mô tả ảnh cho SEO / trình đọc màn hình. */
  alt: string | null;
  modifiedAt: string;
}

/** Một chỗ đang tham chiếu tới file — dùng để cảnh báo trước khi xoá. */
export interface MediaUsage {
  /** Loại nội dung: "Bài viết", "Trang", "Cài đặt website"… */
  type: string;
  title: string;
  /** Số bản ghi cùng loại cùng tên đang tham chiếu tới file. */
  count: number;
}

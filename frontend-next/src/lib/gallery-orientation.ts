'use client';

import { useEffect, useState } from 'react';

/**
 * Logic dùng chung cho gallery tự phân khu theo chiều ảnh:
 * - `parseGalleryImages`: tách <img> ra khỏi HTML nội dung, trả về phần chữ
 *   giới thiệu còn lại + danh sách ảnh.
 * - `useImageOrientations`: đo naturalWidth/Height từng ảnh trên trình duyệt
 *   để biết ảnh khổ ngang hay khổ dọc.
 * Dùng ở cả gallery ngoài site (OrientedGallery) lẫn khối xem trước phân khu
 * trong trang quản trị (GalleryZonePreview) — hai nơi luôn cho kết quả khớp nhau.
 */

export type GalleryImage = { src: string; alt: string };
export type Orientation = 'landscape' | 'portrait';

export function parseGalleryImages(html: string): {
  intro: string;
  images: GalleryImage[];
} {
  const images: GalleryImage[] = [];

  const withoutImages = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = /\bsrc\s*=\s*"([^"]+)"/i.exec(tag)?.[1];
    if (src) {
      const alt = /\balt\s*=\s*"([^"]*)"/i.exec(tag)?.[1] ?? '';
      images.push({ src, alt });
    }
    return '';
  });

  // Editor thường bọc ảnh trong <p>/<figure>; gỡ ảnh xong dọn các vỏ rỗng.
  const intro = withoutImages
    .replace(/<(p|figure|span)[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi, '')
    .trim();

  return { intro, images };
}

/**
 * Đo chiều từng ảnh, trả về map src → orientation (điền dần khi ảnh tải xong).
 * `resolveSrc` cho phép nơi gọi chuẩn hóa URL trước khi tải (vd. admin thêm
 * origin của backend cho đường dẫn /uploads/...).
 */
export function useImageOrientations(
  images: GalleryImage[],
  resolveSrc?: (src: string) => string,
): Record<string, Orientation> {
  const [orientations, setOrientations] = useState<Record<string, Orientation>>(
    {},
  );

  // Không dùng ref đánh dấu "đã probe": StrictMode chạy effect 2 lần, lần đầu
  // bị hủy — nếu lần hai bỏ qua thì không bao giờ có kết quả. Probe lại ảnh
  // trình duyệt đã cache là miễn phí; guard trùng nằm trong setState.
  useEffect(() => {
    let cancelled = false;

    for (const { src } of images) {
      const probe = new window.Image();
      probe.onload = () => {
        if (cancelled) return;
        const orientation: Orientation =
          probe.naturalHeight > probe.naturalWidth ? 'portrait' : 'landscape';
        setOrientations((prev) =>
          prev[src] ? prev : { ...prev, [src]: orientation },
        );
      };
      // Ảnh hỏng vẫn xếp vào khu ngang để không "mất tích" khỏi gallery.
      probe.onerror = () => {
        if (cancelled) return;
        setOrientations((prev) =>
          prev[src] ? prev : { ...prev, [src]: 'landscape' },
        );
      };
      probe.src = resolveSrc ? resolveSrc(src) : src;
    }

    return () => {
      cancelled = true;
    };
  }, [images, resolveSrc]);

  return orientations;
}

import sharp from 'sharp';
import { extname } from 'path';

/**
 * Nén ảnh khi upload (Thư viện ảnh + ảnh bìa bài viết) — mục tiêu ~≤ 1MB.
 *
 * - Thu nhỏ về tối đa MAX_EDGE px cạnh dài (ảnh web không cần lớn hơn), giữ tỉ lệ,
 *   không phóng to ảnh nhỏ.
 * - JPEG/WebP: nén theo QUALITY, mozjpeg + progressive. Còn > TARGET_BYTES thì
 *   hạ quality dần (tối thiểu MIN_QUALITY).
 * - PNG: giữ PNG (bảo toàn trong suốt cho logo/icon) nhưng nén palette; nếu ảnh
 *   PNG là ảnh chụp không trong suốt và vẫn nặng → chuyển sang JPEG (đổi đuôi).
 * - GIF/SVG hoặc lỗi decode: trả nguyên file, không đụng.
 * - Xoay theo EXIF (ảnh điện thoại) và bỏ metadata (giảm dung lượng, bảo mật vị trí).
 *
 * Trả về buffer mới + đuôi file cuối cùng (có thể đổi .png → .jpg).
 */

/** Giới hạn nhận file thô (trước khi nén). Nginx VPS cần client_max_body_size ≥ giá trị này. */
export const MAX_UPLOAD_MB = 15;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const IMAGE_OPTIMIZE = {
  MAX_EDGE: 1920,
  TARGET_BYTES: 1024 * 1024, // ~1MB
  QUALITY: 82,
  MIN_QUALITY: 60,
  /** Ảnh nhỏ hơn ngưỡng này thì bỏ qua (đã đủ nhẹ). */
  SKIP_BELOW_BYTES: 300 * 1024,
} as const;

export type OptimizedImage = {
  buffer: Buffer;
  ext: string; // ".jpg" | ".png" | ".webp" | giữ nguyên
  mime: string;
  changed: boolean;
};

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function optimizeImage(
  buffer: Buffer,
  originalName: string,
  originalMime?: string,
): Promise<OptimizedImage> {
  const ext = extname(originalName).toLowerCase();
  const passthrough: OptimizedImage = {
    buffer,
    ext,
    mime: originalMime || MIME_BY_EXT[ext] || 'application/octet-stream',
    changed: false,
  };

  // Chỉ xử lý jpg/png/webp; gif/svg/khác giữ nguyên
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return passthrough;

  try {
    const meta = await sharp(buffer).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const tooLarge = Math.max(width, height) > IMAGE_OPTIMIZE.MAX_EDGE;
    const tooHeavy = buffer.length > IMAGE_OPTIMIZE.SKIP_BELOW_BYTES;
    if (!tooLarge && !tooHeavy) return passthrough; // đã nhẹ và nhỏ → giữ nguyên

    const base = () =>
      sharp(buffer)
        .rotate() // theo EXIF orientation
        .resize({
          width: IMAGE_OPTIMIZE.MAX_EDGE,
          height: IMAGE_OPTIMIZE.MAX_EDGE,
          fit: 'inside',
          withoutEnlargement: true,
        });

    const encodeJpeg = (q: number) =>
      base().jpeg({ quality: q, mozjpeg: true, progressive: true }).toBuffer();
    const encodeWebp = (q: number) => base().webp({ quality: q }).toBuffer();

    // Giảm quality dần tới khi ≤ TARGET hoặc chạm MIN_QUALITY
    const shrink = async (encode: (q: number) => Promise<Buffer>) => {
      let q: number = IMAGE_OPTIMIZE.QUALITY;
      let out = await encode(q);
      while (out.length > IMAGE_OPTIMIZE.TARGET_BYTES && q > IMAGE_OPTIMIZE.MIN_QUALITY) {
        q -= 8;
        out = await encode(Math.max(q, IMAGE_OPTIMIZE.MIN_QUALITY));
      }
      return out;
    };

    if (ext === '.png') {
      const hasAlpha = Boolean(meta.hasAlpha);
      // PNG trong suốt (logo, icon): giữ PNG, nén palette
      if (hasAlpha) {
        const out = await base()
          .png({ compressionLevel: 9, palette: true, quality: 90, effort: 7 })
          .toBuffer();
        return out.length < buffer.length
          ? { buffer: out, ext: '.png', mime: 'image/png', changed: true }
          : passthrough;
      }
      // PNG không trong suốt (ảnh chụp/screenshot) → JPEG nhẹ hơn nhiều
      const out = await shrink(encodeJpeg);
      return { buffer: out, ext: '.jpg', mime: 'image/jpeg', changed: true };
    }

    if (ext === '.webp') {
      const out = await shrink(encodeWebp);
      return out.length < buffer.length
        ? { buffer: out, ext: '.webp', mime: 'image/webp', changed: true }
        : passthrough;
    }

    // jpg / jpeg
    const out = await shrink(encodeJpeg);
    return out.length < buffer.length
      ? { buffer: out, ext: '.jpg', mime: 'image/jpeg', changed: true }
      : passthrough;
  } catch {
    // ảnh lỗi/định dạng lạ → không chặn upload, giữ nguyên
    return passthrough;
  }
}

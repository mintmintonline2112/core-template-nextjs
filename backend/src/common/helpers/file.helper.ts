import { extname } from 'path';

export class FileHelper {
  static cleanFileName(originalName: string): string {
    const fileExtName = extname(originalName);
    const fileName = originalName.replace(fileExtName, '');

    return (
      fileName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase() + fileExtName
    );
  }
}

/**
 * Tên file upload GIỮ TÊN GỐC (đã bỏ dấu, slug hóa) thay vì timestamp ngẫu nhiên
 * để thư viện ảnh đọc được: "Ảnh bác sĩ Long.JPG" → "anh-bac-si-long.jpg".
 * Trùng tên trong cùng thư mục → thêm hậu tố -2, -3... Tên rỗng/toàn ký tự lạ
 * → fallback "image". Multer đưa originalname dạng latin1 với tên Unicode →
 * decode lại utf8 trước.
 */
export function uniqueUploadName(
  originalName: string,
  exists: (candidate: string) => boolean,
): string {
  let decoded = originalName;
  try {
    const utf8 = Buffer.from(originalName, 'latin1').toString('utf8');
    // chỉ nhận bản decode nếu không sinh ký tự thay thế (U+FFFD)
    if (!utf8.includes('�') && /[^\x00-\x7F]/.test(originalName)) decoded = utf8;
  } catch {
    /* giữ nguyên */
  }
  const ext = (extname(decoded).toLowerCase() || '.jpg').replace(/[^a-z0-9.]/g, '');
  const base =
    decoded
      .slice(0, decoded.length - extname(decoded).length)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'image';

  let candidate = `${base}${ext}`;
  let n = 2;
  while (exists(candidate)) candidate = `${base}-${n++}${ext}`;
  return candidate;
}

/** Đuôi file ảnh hợp lệ, suy ra từ nội dung thật của file. */
export type ImageKind = '.jpg' | '.png' | '.webp' | '.gif';

export const MIME_BY_IMAGE_KIND: Record<ImageKind, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

/**
 * Nhận dạng ảnh bằng "magic bytes" thay vì tin `file.mimetype` — header đó do
 * trình duyệt gửi lên nên giả mạo được. Trả null nếu không phải ảnh hỗ trợ.
 *
 * Thiếu bước này thì file .svg hoặc .html khai man `image/png` vẫn được lưu
 * nguyên vẹn vào /uploads (bộ nén bỏ qua đuôi lạ) rồi mở thẳng trên domain API
 * — tức là XSS lưu trữ.
 */
export function detectImageKind(buffer: Buffer): ImageKind | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return '.jpg';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.subarray(0, 8).equals(pngMagic)) return '.png';

  // WEBP: "RIFF" .... "WEBP"
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return '.webp';
  }

  // GIF: "GIF87a" | "GIF89a"
  const gif = buffer.subarray(0, 6).toString('ascii');
  if (gif === 'GIF87a' || gif === 'GIF89a') return '.gif';

  return null;
}

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

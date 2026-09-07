import { Repository } from 'typeorm';

// Dải ký tự dấu thanh tổ hợp (combining diacritical marks) U+0300–U+036F.
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Chuyển một chuỗi (kể cả tiếng Việt có dấu) thành slug thân thiện cho URL/SEO.
 * Ví dụ: "Tranh Canvas Phong Cảnh" → "tranh-canvas-phong-canh".
 */
export function slugify(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFD') // tách ký tự + dấu
    .replace(COMBINING_MARKS, '') // bỏ dấu thanh
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // bỏ ký tự đặc biệt
    .replace(/[\s_]+/g, '-') // khoảng trắng/underscore → gạch ngang
    .replace(/-+/g, '-') // gộp nhiều gạch ngang
    .replace(/^-+|-+$/g, ''); // bỏ gạch ngang ở đầu/cuối
}

/**
 * Sinh slug duy nhất trong phạm vi một Set đã dùng (đồng bộ, không truy vấn DB).
 * Dùng cho seeding hoặc xử lý hàng loạt trong bộ nhớ.
 */
export function uniqueSlugInSet(
  base: string,
  used: Set<string>,
  fallback = 'item',
): string {
  const baseSlug = slugify(base) || fallback;
  let candidate = baseSlug;
  let i = 1;
  while (used.has(candidate)) {
    i += 1;
    candidate = `${baseSlug}-${i}`;
  }
  used.add(candidate);
  return candidate;
}

/**
 * Sinh slug duy nhất cho một entity. Nếu slug đã tồn tại sẽ tự thêm hậu tố
 * `-2`, `-3`,... cho tới khi không trùng. Bỏ qua chính bản ghi đang cập nhật
 * thông qua `excludeId`.
 */
export async function generateUniqueSlug<T extends { id?: number }>(
  repo: Repository<T>,
  base: string,
  options: { excludeId?: number; column?: string; fallback?: string } = {},
): Promise<string> {
  const column = options.column ?? 'slug';
  const baseSlug = slugify(base) || options.fallback || 'item';

  let candidate = baseSlug;
  let counter = 1;

  // Lặp tới khi tìm được slug chưa ai dùng (tính cả bản ghi đã soft-delete).
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await repo.findOne({
      where: { [column]: candidate } as any,
      withDeleted: true,
    });

    // Compare as strings: route params arrive as strings while entity ids are numbers.
    const isSelf =
      options.excludeId != null &&
      String(existing?.id) === String(options.excludeId);
    if (!existing || isSelf) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

/**
 * Đa ngôn ngữ: helper merge cột JSON `translations` đè lên bản gốc tiếng Anh.
 *
 * Nội dung gốc của website là TIẾNG ANH ('en'); ngôn ngữ phụ ('vi', ...)
 * lưu trong cột `translations` và merge đè khi client truyền `?lang=`.
 *
 * - `Translations` = { vi?: Record<field, value> } — mở rộng ngôn ngữ chỉ là thêm key.
 * - `applyTranslations(entity, lang)` trả về BẢN SAO với field nào có bản dịch
 *   khác rỗng thì thay, còn lại giữ nguyên tiếng Anh (fallback từng field).
 * - Riêng `metadata` (nội dung có cấu trúc của section) merge thêm một cấp:
 *   `translations.vi.metadata = { items: [...], note: '...' }` chỉ đè những key
 *   có mặt; key khác (ảnh, layout, _component…) giữ theo bản gốc.
 * - `lang` không hợp lệ / 'en' → trả nguyên entity.
 */

export const SUPPORTED_LANGS = ['en', 'vi'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export type TranslatableLang = Exclude<Lang, 'en'>;

export type Translations = Partial<
  Record<TranslatableLang, Record<string, unknown>>
>;

/** Key metadata không bao giờ lấy từ bản dịch (quyết định cách render). */
const STRUCTURAL_META_KEYS = ['_component', 'layout'];

export function normalizeLang(raw: unknown): Lang {
  return raw === 'vi' ? 'vi' : 'en';
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.keys(value).length > 0;
  return true;
}

/** Bản dịch metadata đè lên metadata gốc (một cấp; mảng thay cả mảng). */
export function mergeMetadataTranslation(
  base: unknown,
  translated: unknown,
): Record<string, unknown> | undefined {
  if (!isObject(translated)) return undefined;
  const out: Record<string, unknown> = isObject(base) ? { ...base } : {};
  for (const [key, value] of Object.entries(translated)) {
    if (STRUCTURAL_META_KEYS.includes(key) || !hasValue(value)) continue;
    out[key] = value;
  }
  return out;
}

/**
 * Merge nông: chỉ đè field cấp 1 (metadata merge thêm một cấp). Không đụng
 * `translations` gốc (giữ để frontend/admin còn đọc được nếu cần).
 */
export function applyTranslations<T extends { translations?: unknown }>(
  entity: T,
  lang: Lang,
): T {
  if (lang === 'en' || !entity) return entity;
  const bag = (entity.translations as Translations | null | undefined)?.[lang];
  if (!bag || typeof bag !== 'object') return entity;

  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(bag)) {
    if (key === 'metadata') {
      const merged = mergeMetadataTranslation((entity as Record<string, unknown>).metadata, value);
      if (merged) patch.metadata = merged;
      continue;
    }
    if (hasValue(value)) patch[key] = value;
  }
  return Object.keys(patch).length ? { ...entity, ...patch } : entity;
}

/** Validate nông cho DTO: object với key thuộc SUPPORTED_LANGS (trừ en), value là object. */
export function isValidTranslations(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object' || Array.isArray(value)) return false;
  for (const [lang, bag] of Object.entries(value as Record<string, unknown>)) {
    if (lang === 'en' || !SUPPORTED_LANGS.includes(lang as Lang)) return false;
    if (bag !== null && (typeof bag !== 'object' || Array.isArray(bag)))
      return false;
  }
  return true;
}

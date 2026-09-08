import type { GenericFormField, GenericFormGroup } from '@/app/admin/_components/generic-form/types';

/**
 * Nhóm field "Bản dịch tiếng Việt" dùng chung cho các form CMS.
 * Backend nhận `translations: { vi: { field: value } }`; trường nào để trống
 * thì website (?lang=vi) tự fallback về bản tiếng Anh của trường đó.
 */
export const ZH_GROUP: GenericFormGroup = {
  id: 'zh',
  title: 'Bản dịch tiếng Việt',
  description: 'Để trống trường nào thì website hiển thị bản tiếng Anh của trường đó.',
  collapsed: true,
};

export type ZhFieldSpec = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext';
  placeholder?: string;
};

export const zhKey = (key: string) => `zh_${key}`;

export function zhFields(specs: ZhFieldSpec[]): GenericFormField[] {
  return specs.map((spec) => ({
    key: zhKey(spec.key),
    label: `${spec.label} (Tiếng Việt)`,
    type: spec.type,
    group: ZH_GROUP.id,
    placeholder: spec.placeholder,
  }));
}

function zhObjectOf(translations: unknown): Record<string, unknown> {
  if (!translations || typeof translations !== 'object') return {};
  const zh = (translations as Record<string, unknown>).vi;
  if (!zh || typeof zh !== 'object' || Array.isArray(zh)) return {};
  return zh as Record<string, unknown>;
}

export type ZhValues<K extends string> = { [P in K as `zh_${P}`]: string };

/** Đọc translations.vi[key] → { zh_key: value } (chuỗi rỗng nếu thiếu). */
export function zhValuesFrom<K extends string>(
  translations: unknown,
  keys: readonly K[],
): ZhValues<K> {
  const zh = zhObjectOf(translations);
  const out: Record<string, string> = {};
  for (const key of keys) {
    const value = zh[key];
    out[zhKey(key)] = typeof value === 'string' ? value : value == null ? '' : String(value);
  }
  return out as ZhValues<K>;
}

const EMPTY_RICHTEXT = /^(\s*<p>\s*<\/p>\s*)+$/;

function cleanZhValue(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed || EMPTY_RICHTEXT.test(trimmed)) return null;
  return trimmed;
}

/**
 * Gom values.zh_* thành payload { vi: { key: value } }.
 * - Chỉ lấy chuỗi không rỗng (richtext '<p></p>' coi là rỗng).
 * - Giữ nguyên các key khác đã có trong existing.vi nhưng không nằm trong `keys`.
 * - Trả null nếu zh rỗng (caller gửi translations: null để xoá).
 */
export function zhTranslationsPayload(
  values: object,
  keys: readonly string[],
  existing?: unknown,
): Record<string, Record<string, unknown>> | null {
  const zh: Record<string, unknown> = {};
  const source = values as Record<string, unknown>;

  for (const [key, value] of Object.entries(zhObjectOf(existing))) {
    if (!keys.includes(key)) zh[key] = value;
  }

  for (const key of keys) {
    const cleaned = cleanZhValue(source[zhKey(key)]);
    if (cleaned !== null) zh[key] = cleaned;
  }

  return Object.keys(zh).length > 0 ? { vi: zh } : null;
}

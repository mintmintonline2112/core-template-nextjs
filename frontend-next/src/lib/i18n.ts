/**
 * Ngôn ngữ site Prime Nuts USA: nội dung gốc TIẾNG ANH ('en'); bản dịch phụ
 * ('vi') lưu ở cột `translations` phía backend và truy vấn qua `?lang=vi`.
 * Site public hiện chỉ render bản tiếng Anh — file này giữ type/helper tối
 * thiểu cho các lib dùng chung (settings, contact-page, admin).
 */

export const LANGS = ["en", "vi"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export const HTML_LANG: Record<Lang, string> = { en: "en", vi: "vi" };
export const INTL_LOCALE: Record<Lang, string> = { en: "en-US", vi: "vi-VN" };

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "vi";
}

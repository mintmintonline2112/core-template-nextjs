import { apiFetch } from "@/lib/api";
import { SITE_CONTACT } from "@/config/contact";
import { DEFAULT_LANG, type Lang } from "@/lib/i18n";

/**
 * Cấu hình toàn site do admin chỉnh tại /admin/settings.
 * Lỗi API → trả object rỗng, site dùng mặc định trong code/CSS.
 */

export type ThemeColorOverrides = Partial<{
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  heading: string;
  /** Chữ menu dial (desktop + mobile) — mặc định ăn theo màu chữ phụ. */
  menuFg: string;
}>;

export interface SiteSettings {
  siteTitle?: string;
  siteDescription?: string;
  /** Chữ hiển thị cạnh logo góc trên trái — trống dùng mặc định theme ("Prime Nuts USA"). */
  brandName?: string;
  /** Dòng chữ cuối trang, hiện sau "© <năm> " — trống dùng mặc định i18n. */
  footerText?: string;
  faviconUrl?: string;
  logoUrl?: string;
  logoHeight?: number;
  /** Logo riêng cho footer (nền tối) — trống dùng logoUrl. */
  footerLogoUrl?: string;
  footerLogoHeight?: number;
  heroImageUrl?: string;
  /** Ảnh đại diện khi chia sẻ link (og:image) — trống thì dùng heroImageUrl. */
  ogImageUrl?: string;
  fontFamily?: string;
  /** Cỡ chữ tối đa (px, desktop) của tiêu đề bài viết — mobile tự co. Trống = 56. */
  postTitleSize?: number;
  colorsDark?: ThemeColorOverrides;
  colorsLight?: ThemeColorOverrides;
  translateEnabled?: boolean;
  copyProtection?: boolean;
  /** Hiện ngày đăng + số phút đọc trên bài viết (mặc định bật; false = ẩn toàn site). */
  showPostMeta?: boolean;
  /** Bản dịch settings: { zh: { siteTitle, siteDescription } } — chỉ admin dùng, public đã được merge. */
  translations?: Partial<
    Record<
      "vi",
      { siteTitle?: string; siteDescription?: string; brandName?: string; footerText?: string }
    >
  >;
  /** Link mạng xã hội hiện ở trang Liên hệ — để trống mục nào thì ẩn mục đó. */
  socialLinks?: SocialLinks;
  /** Cấu hình trang Liên hệ — xem lib/contact-page.ts. */
  contactPage?: import("@/lib/contact-page").ContactPageConfig | null;
}

export type SocialKey = "facebook" | "youtube" | "instagram" | "tiktok";
export type SocialLinks = Partial<Record<SocialKey, string>>;

/** Giới hạn cỡ chữ tiêu đề bài viết (px) — khớp slider trong admin. */
export const POST_TITLE_MIN = 28;
export const POST_TITLE_MAX = 96;
export const POST_TITLE_DEFAULT = 56;

export const FONT_STACKS: Record<string, string> = {
  system: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  times: "'Times New Roman', Times, serif",
  arial: "Arial, Helvetica, sans-serif",
};

/**
 * Thông tin liên hệ hiển thị trên site: ưu tiên giá trị admin nhập ở
 * /admin/contact-page, thiếu ô nào thì lấy mặc định trong src/config/contact.ts.
 */
export function resolveContact(settings: SiteSettings) {
  const company = settings.contactPage?.company ?? {};
  const phone = company.phone?.trim() || SITE_CONTACT.phone;
  return {
    name: company.name?.trim() || "Prime Nuts USA",
    location: company.location?.trim() || SITE_CONTACT.location,
    address: company.address?.trim() || SITE_CONTACT.address,
    email: company.email?.trim() || SITE_CONTACT.email,
    phone,
    phoneHref: `tel:${phone.replace(/[^\d+]/g, "")}`,
    mapUrl: company.mapUrl?.trim() || null,
  };
}

export type SiteContact = ReturnType<typeof resolveContact>;

export async function getSiteSettings(
  lang: Lang = DEFAULT_LANG,
): Promise<SiteSettings> {
  try {
    const path =
      lang === DEFAULT_LANG ? "client/settings" : `client/settings?lang=${lang}`;
    const settings = await apiFetch<SiteSettings>(path, {
      next: { revalidate: 60, tags: ["settings"] },
    });
    return settings ?? {};
  } catch {
    return {};
  }
}

/* key setting → tên biến CSS (key camelCase không trùng tên biến kebab-case) */
const COLOR_VARS: Record<keyof ThemeColorOverrides & string, string> = {
  bg: "--bg",
  surface: "--surface",
  ink: "--ink",
  muted: "--muted",
  accent: "--accent",
  heading: "--heading",
  menuFg: "--menu-fg",
};
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

function colorBlock(overrides: ThemeColorOverrides | undefined): string {
  if (!overrides) return "";
  return (Object.keys(COLOR_VARS) as Array<keyof ThemeColorOverrides>)
    .filter((key) => HEX_RE.test(overrides[key] ?? ""))
    .map((key) => `${COLOR_VARS[key]}: ${overrides[key]};`)
    .join(" ");
}

function safeCssUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/["'()\\\s]/g, "");
  if (!/^(https?:\/\/|\/)/.test(cleaned)) return null;
  return cleaned;
}

export function buildThemeCss(settings: SiteSettings): string {
  const parts: string[] = [];

  const heroUrl = safeCssUrl(settings.heroImageUrl);
  if (heroUrl) parts.push(`:root { --hero-image: url("${heroUrl}"); }`);

  const dark = colorBlock(settings.colorsDark);
  if (dark) parts.push(`:root { ${dark} }`);

  const light = colorBlock(settings.colorsLight);
  if (light) parts.push(`html[data-theme="light"] { ${light} }`);

  const titleSize = Number(settings.postTitleSize);
  if (Number.isFinite(titleSize) && titleSize >= POST_TITLE_MIN && titleSize <= POST_TITLE_MAX) {
    parts.push(`:root { --post-title-size: ${Math.round(titleSize)}px; }`);
  }

  const stack = settings.fontFamily ? FONT_STACKS[settings.fontFamily] : undefined;
  if (stack) parts.push(`body { font-family: ${stack} !important; }`);

  return parts.join("\n");
}

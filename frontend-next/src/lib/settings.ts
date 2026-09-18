import { apiFetch } from "@/lib/api";
import { SITE_CONTACT } from "@/config/contact";
import { env } from "@/lib/env";
import { DEFAULT_LANG, type Lang } from "@/lib/i18n";

/**
 * Cấu hình toàn site do admin chỉnh tại /admin/settings.
 * Lỗi API → trả object rỗng, site dùng mặc định trong code/CSS.
 */

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
  /** 4 màu thương hiệu (#RRGGBB) — xem lib/brand-colors.ts. Trống = màu mặc định trong base.css. */
  brandColors?: import("@/lib/brand-colors").BrandColors | null;
  translateEnabled?: boolean;
  /** Chặn chuột phải / bôi đen / Ctrl+C trên website (mặc định bật; false = tắt). */
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

/** Tên thương hiệu khi Admin → Cài đặt → Tên logo để trống. */
export const DEFAULT_BRAND_NAME = "Prime Nuts USA";

/** Favicon mặc định (frontend-next/public) khi admin chưa chọn ảnh. */
export const DEFAULT_FAVICON = "/favicon.svg";

/** Tên thương hiệu đang dùng — cho tiêu đề tab, hậu tố SEO, tên admin. */
export function brandNameOf(settings: SiteSettings): string {
  return settings.brandName?.trim() || DEFAULT_BRAND_NAME;
}

/**
 * Đường dẫn favicon dùng CHUNG cho site public và dashboard admin:
 * /images/... là file tĩnh của frontend, còn lại là ảnh upload nằm ở phía API.
 */
export function faviconHref(settings: SiteSettings): string {
  const path = settings.faviconUrl?.trim();
  if (!path) return DEFAULT_FAVICON;
  if (/^https?:\/\//.test(path) || path.startsWith("/images/")) return path;
  const base = env.publicApiUrl.replace(/\/api$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

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
    hours: company.hours?.trim() || SITE_CONTACT.hours,
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


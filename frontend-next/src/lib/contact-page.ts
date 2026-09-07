import type { Lang } from "@/lib/i18n";
import type { SocialLinks } from "@/lib/settings";

/**
 * Cấu hình trang Liên hệ — lưu trong site_settings key `contactPage` (1 JSON),
 * quản trị tại /admin/contact-page. Mọi trường đều tùy chọn: thiếu thì trang
 * public dùng từ điển i18n / mặc định trong code (không bao giờ trống).
 *
 * Bản dịch tiếng Trung nằm ngay trong từng nhóm dưới key `zh` (đơn giản hơn
 * cột translations vì đây là 1 object cấu hình, không phải bảng nội dung).
 */

export type ContactInterest = {
  /** Giá trị gửi lên API (subject) — tiếng Việt để admin đọc trong danh sách liên hệ. */
  value: string;
  /** Nhãn hiển thị tiếng Trung (tùy chọn). */
  vi?: string;
};

export type ContactPageConfig = {
  hero?: {
    eyebrow?: string;
    title?: string;
    lead?: string;
    vi?: { eyebrow?: string; title?: string; lead?: string };
  };
  /** Khung "Gọi trực tiếp" — to nhất, đứng đầu danh sách kênh liên hệ. */
  hotline?: {
    enabled?: boolean;
    /** Số hiển thị — trống thì dùng clinic.phone. */
    phone?: string;
    label?: string;
    note?: string;
    vi?: { label?: string; note?: string };
  };
  /** Khung Zalo (ảnh QR + link mở Zalo) nằm ngay trên Facebook. */
  zalo?: {
    qrUrl?: string;
    /** Link zalo.me/... — trống thì suy từ số hotline. */
    url?: string;
  };
  social?: SocialLinks;
  clinic?: {
    enabled?: boolean;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
    mapUrl?: string;
    /** Link nhúng Google Maps (iframe src) — tùy chọn, có thì hiện bản đồ. */
    mapEmbedUrl?: string;
    vi?: { name?: string; address?: string; hours?: string };
  };
  form?: {
    enabled?: boolean;
    kicker?: string;
    title?: string;
    interests?: ContactInterest[];
    note?: string;
    vi?: { kicker?: string; title?: string; note?: string };
  };
};

/** Danh sách "Nhu cầu quan tâm" mặc định khi admin chưa cấu hình. */
export const DEFAULT_INTERESTS: ContactInterest[] = [
  { value: "Request a quotation", vi: "Yêu cầu báo giá" },
  { value: "Distribution partnership", vi: "Hợp tác phân phối" },
  { value: "Logistics & documentation", vi: "Vận chuyển & chứng từ" },
  { value: "Product specifications", vi: "Thông số sản phẩm" },
  { value: "General inquiry", vi: "Yêu cầu khác" },
];

/** Lấy giá trị theo ngôn ngữ: zh có thì dùng, không thì fallback tiếng Việt. */
export function pick<T extends Record<string, unknown>>(
  group: (T & { vi?: Partial<T> }) | undefined,
  key: keyof T & string,
  lang: Lang,
): string {
  const zhVal = lang === "vi" ? group?.vi?.[key] : undefined;
  const val = (typeof zhVal === "string" && zhVal.trim()) || group?.[key];
  return typeof val === "string" ? val.trim() : "";
}

export function interestLabel(item: ContactInterest, lang: Lang): string {
  return (lang === "vi" && item.vi?.trim()) || item.value;
}

export function phoneDigits(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function telHref(phone: string): string {
  return `tel:${phoneDigits(phone)}`;
}

/** 10 số liền → "0909 881 687"; các dạng khác giữ nguyên như admin nhập. */
export function formatPhone(phone: string): string {
  const raw = phone.trim();
  return /^\d{10}$/.test(raw) ? `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}` : raw;
}

/** Bỏ giao thức/`www.`/query để hiện link gọn (dùng chung với SocialLinks). */
export function displayUrl(url: string): string {
  return url
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "");
}

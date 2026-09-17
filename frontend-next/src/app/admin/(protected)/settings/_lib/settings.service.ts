import { adminApi } from '@/app/admin/_lib/admin-api';
import type { BrandColors } from '@/lib/brand-colors';

export const SETTINGS_QUERY_KEY = ['admin', 'settings'] as const;

export interface SiteSettings {
  siteTitle?: string;
  siteDescription?: string;
  /** Chữ hiển thị cạnh logo góc trên trái — trống dùng mặc định theme. */
  brandName?: string;
  /** Dòng chữ cuối trang (sau "© <năm> ") — trống dùng mặc định. */
  footerText?: string;
  faviconUrl?: string;
  logoUrl?: string;
  logoHeight?: number;
  footerLogoUrl?: string;
  footerLogoHeight?: number;
  heroImageUrl?: string;
  ogImageUrl?: string;
  fontFamily?: string;
  /** Cỡ chữ tối đa (px, desktop) của tiêu đề bài viết — xem lib/settings.ts. */
  postTitleSize?: number;
  /** 4 màu thương hiệu — xem src/lib/brand-colors.ts. */
  brandColors?: BrandColors | null;
  translateEnabled?: boolean;
  copyProtection?: boolean;
  showPostMeta?: boolean;
  translations?: {
    vi?: {
      siteTitle?: string;
      siteDescription?: string;
      brandName?: string;
      footerText?: string;
    };
  } | null;
  socialLinks?: Partial<Record<'facebook' | 'youtube' | 'instagram' | 'tiktok', string>> | null;
  /** Cấu hình trang Liên hệ — xem src/lib/contact-page.ts */
  contactPage?: import('@/lib/contact-page').ContactPageConfig | null;
}

export const settingsService = {
  get(): Promise<SiteSettings> {
    return adminApi.get<SiteSettings>('admin/settings');
  },
  update(values: Record<string, unknown>): Promise<SiteSettings> {
    return adminApi.put<SiteSettings>('admin/settings', values);
  },
};

/** Giới hạn slider cỡ chữ tiêu đề bài viết (px) — khớp POST_TITLE_* ở lib/settings.ts. */
export const POST_TITLE_MIN = 28;
export const POST_TITLE_MAX = 96;
export const POST_TITLE_DEFAULT = 56;

export const FONT_OPTIONS = [
  { value: '', label: 'Roboto (mặc định của website)' },
  { value: 'system', label: 'Font hệ thống (system-ui)' },
  { value: 'georgia', label: 'Georgia (serif)' },
  { value: 'times', label: 'Times New Roman (serif)' },
  { value: 'arial', label: 'Arial (sans-serif)' },
];

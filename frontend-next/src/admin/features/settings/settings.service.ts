import { adminApi } from '@/admin/core/admin-api';

export const SETTINGS_QUERY_KEY = ['admin', 'settings'] as const;

export type ThemeColorOverrides = Partial<{
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  heading: string;
  /** Chữ menu dial (vòng cung góc trái) — mặc định ăn theo "Chữ phụ". */
  menuFg: string;
}>;

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
  heroImageUrl?: string;
  ogImageUrl?: string;
  fontFamily?: string;
  /** Cỡ chữ tối đa (px, desktop) của tiêu đề bài viết — xem lib/settings.ts. */
  postTitleSize?: number;
  colorsDark?: ThemeColorOverrides;
  colorsLight?: ThemeColorOverrides;
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

export const COLOR_TOKENS: Array<{
  key: keyof ThemeColorOverrides;
  label: string;
  darkDefault: string;
  lightDefault: string;
}> = [
  { key: 'bg', label: 'Nền trang', darkDefault: '#494946', lightDefault: '#cbc9c3' },
  { key: 'surface', label: 'Nền card', darkDefault: '#53524f', lightDefault: '#dfddd7' },
  { key: 'ink', label: 'Chữ chính', darkDefault: '#f0efeb', lightDefault: '#17171a' },
  { key: 'muted', label: 'Chữ phụ', darkDefault: '#bbb9b2', lightDefault: '#55544f' },
  { key: 'accent', label: 'Điểm nhấn', darkDefault: '#d9d9dc', lightDefault: '#2a2a30' },
  { key: 'heading', label: 'Heading (vàng đồng)', darkDefault: '#c2ad76', lightDefault: '#786238' },
  // Mặc định ăn theo "Chữ phụ" (--menu-fg: var(--muted)); default hiển thị
  // trong ô màu phải khớp giá trị đó để chưa đổi thì thấy đúng màu đang dùng.
  { key: 'menuFg', label: 'Chữ menu (vòng cung)', darkDefault: '#bbb9b2', lightDefault: '#55544f' },
];

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

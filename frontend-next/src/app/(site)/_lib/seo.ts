import type { Metadata } from "next";
import { env } from "@/lib/env";
import { getSiteSettings } from "@/lib/settings";
import { mediaUrl } from "./cms";

/**
 * SEO cho site public: 1 hàm dựng đủ title / description / canonical /
 * Open Graph / Twitter cho từng trang. Mọi page.tsx trong (site) gọi
 * buildPageMetadata() thay vì tự viết object Metadata.
 *
 * Lưu ý của Next.js: `openGraph` / `twitter` ở page GHI ĐÈ nguyên khối của
 * layout (không merge sâu), nên helper phải điền đầy đủ mọi field mỗi lần.
 */

export const SITE_NAME = "Prime Nuts USA";
export const SITE_DEFAULT_TITLE = "Prime Nuts USA — California Almonds. Sourced with Confidence.";
export const SITE_DEFAULT_DESCRIPTION =
  "Reliable California almond sourcing, procurement, and export coordination for wholesale buyers worldwide.";
/** Ảnh chia sẻ mặc định khi CMS và Cài đặt đều không có ảnh (public/images). */
export const DEFAULT_OG_IMAGE = "/images/hero-branch.jpg";
export const SITE_LOCALE = "en_US";

/** URL tuyệt đối, tôn trọng `trailingSlash: true` trong next.config để canonical không bị redirect. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const [pathname, rest = ""] = path.split(/(?=[?#])/, 2);
  const withSlash =
    pathname === "/" || pathname.endsWith("/") || /\.[a-z0-9]+$/i.test(pathname)
      ? pathname
      : `${pathname}/`;
  return `${env.siteUrl}${withSlash}${rest}`;
}

export type PageSeoInput = {
  title: string;
  /** true → không áp template "%s — Prime Nuts USA" (dùng cho trang chủ). */
  absoluteTitle?: boolean;
  description?: string | null;
  /** Đường dẫn tương đối của trang, lấy từ siteRoutes. */
  path: string;
  /** Ảnh OG: path CMS (/uploads/…) hoặc URL tuyệt đối. */
  image?: string | null;
  /** canonicalUrl admin nhập; trống thì dùng chính URL trang. */
  canonical?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noIndex?: boolean;
};

export async function buildPageMetadata(input: PageSeoInput): Promise<Metadata> {
  const settings = await getSiteSettings();

  const description = input.description ?? SITE_DEFAULT_DESCRIPTION;
  const image =
    mediaUrl(input.image) ?? settings.ogImageUrl ?? settings.heroImageUrl ?? DEFAULT_OG_IMAGE;
  const url = absoluteUrl(input.canonical ?? input.path);
  // metaTitle admin nhập thường đã có sẵn tên brand → không gắn hậu tố lần nữa.
  const absolute = input.absoluteTitle || input.title.includes(SITE_NAME);
  const socialTitle = absolute ? input.title : `${input.title} — ${SITE_NAME}`;
  const type = input.type ?? "website";

  return {
    title: absolute ? { absolute: input.title } : input.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title: socialTitle,
      description,
      url,
      images: [{ url: image, alt: socialTitle }],
      ...(type === "article"
        ? {
            publishedTime: input.publishedTime ?? undefined,
            modifiedTime: input.modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
    ...(input.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

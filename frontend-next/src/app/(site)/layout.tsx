import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/app/(site)/_components/Footer";
import { Header } from "@/app/(site)/_components/Header";
import { SiteEffects } from "@/app/(site)/_components/SiteEffects";
import { mediaUrl } from "@/app/(site)/_lib/cms";
import { getSiteMenu } from "@/app/(site)/_lib/menu";
import { FONT_STACKS, getSiteSettings } from "@/lib/settings";
import {
  DEFAULT_OG_IMAGE,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_LOCALE,
  SITE_NAME,
} from "@/app/(site)/_lib/seo";

/**
 * Metadata mặc định cho mọi trang public. Từng page.tsx ghi đè bằng
 * buildPageMetadata() (lấy metaTitle/metaDescription/ogImage từ CMS).
 * Site KHÔNG khai báo noindex — mặc định của Google là index.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const image = settings.ogImageUrl ?? settings.heroImageUrl ?? DEFAULT_OG_IMAGE;
  // Admin → Cài đặt → Favicon: có thì đè /favicon.svg mặc định.
  const favicon = mediaUrl(settings.faviconUrl);
  return {
    title: { default: SITE_DEFAULT_TITLE, template: `%s — ${SITE_NAME}` },
    ...(favicon ? { icons: { icon: favicon } } : {}),
    description: SITE_DEFAULT_DESCRIPTION,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title: SITE_DEFAULT_TITLE,
      description: SITE_DEFAULT_DESCRIPTION,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_DEFAULT_TITLE,
      description: SITE_DEFAULT_DESCRIPTION,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

/** Khung site public: header (menu CMS) + nội dung + footer + hiệu ứng. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [menu, settings] = await Promise.all([getSiteMenu(), getSiteSettings()]);

  // Admin → Cài đặt → Font chữ: đè --font-main của site; trống = Roboto mặc định.
  const fontStack = settings.fontFamily ? FONT_STACKS[settings.fontFamily] : undefined;

  // Admin → Cài đặt → Logo: ảnh upload (/uploads/...) trỏ về backend qua mediaUrl.
  const brand = {
    logoUrl: mediaUrl(settings.logoUrl),
    logoHeight: settings.logoHeight ?? null,
    brandName: settings.brandName ?? null,
  };

  return (
    <>
      {fontStack ? (
        <style>{`:root { --font-main: ${fontStack}; }`}</style>
      ) : null}
      <SiteEffects />
      <Header menu={menu} brand={brand} />
      <main id="main">{children}</main>
      <Footer brand={brand} />
    </>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/app/(site)/_components/Footer";
import { Header } from "@/app/(site)/_components/Header";
import { CopyGuard } from "@/app/(site)/_components/CopyGuard";
import { SiteEffects } from "@/app/(site)/_components/SiteEffects";
import { brandColorsCss } from "@/lib/brand-colors";
import { mediaUrl } from "@/app/(site)/_lib/cms";
import { getSiteMenu } from "@/app/(site)/_lib/menu";
import {
  faviconHref,
  FONT_STACKS,
  getSiteSettings,
  resolveContact,
} from "@/lib/settings";
import {
  DEFAULT_OG_IMAGE,
  resolveSiteSeo,
  SITE_LOCALE,
} from "@/app/(site)/_lib/seo";

/**
 * Metadata mặc định cho mọi trang public. Từng page.tsx ghi đè bằng
 * buildPageMetadata() (lấy metaTitle/metaDescription/ogImage từ CMS).
 * Site KHÔNG khai báo noindex — mặc định của Google là index.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const image = settings.ogImageUrl ?? settings.heroImageUrl ?? DEFAULT_OG_IMAGE;
  // Admin → Cài đặt → Thương hiệu & SEO; ô nào trống thì dùng mặc định trong seo.ts.
  const site = resolveSiteSeo(settings);
  return {
    title: { default: site.title, template: `%s — ${site.name}` },
    // Admin → Cài đặt → Favicon: có thì đè /favicon.svg mặc định.
    icons: { icon: faviconHref(settings) },
    description: site.description,
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: SITE_LOCALE,
      title: site.title,
      description: site.description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
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

  // Admin → Cài đặt → Logo. /images/... là file tĩnh của site (logo mặc định),
  // còn ảnh chọn từ Thư viện (/uploads/...) trỏ về backend qua mediaUrl.
  const logo = (path?: string | null) =>
    !path ? null : path.startsWith("/images/") ? path : mediaUrl(path);
  const brand = {
    logoUrl: logo(settings.logoUrl),
    logoHeight: settings.logoHeight ?? null,
    brandName: settings.brandName ?? null,
  };
  // Footer có logo riêng (bản sáng cho nền xanh đậm); để trống thì dùng logo chính.
  const footerBrand = settings.footerLogoUrl
    ? { ...brand, logoUrl: logo(settings.footerLogoUrl), logoHeight: settings.footerLogoHeight ?? null }
    : brand;

  const contact = resolveContact(settings);

  // Admin → Cài đặt → Màu thương hiệu: đè 4 biến gốc --brand-*, mọi sắc độ tự
  // suy ra trong styles/base.css. Chưa đổi màu nào thì không chèn gì.
  const brandCss = brandColorsCss(settings.brandColors);

  return (
    <>
      {fontStack ? (
        <style>{`:root { --font-main: ${fontStack}; }`}</style>
      ) : null}
      {brandCss ? <style>{brandCss}</style> : null}
      {/* Admin → Cài đặt → Hạn chế sao chép (mặc định bật, tắt hẳn khi = false) */}
      {settings.copyProtection !== false ? <CopyGuard /> : null}
      <SiteEffects />
      <Header menu={menu} brand={brand} contact={contact} social={settings.socialLinks} />
      <main id="main">{children}</main>
      <Footer
        brand={footerBrand}
        contact={contact}
        footerText={settings.footerText ?? null}
      />
    </>
  );
}

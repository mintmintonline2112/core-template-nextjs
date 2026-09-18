import type { Metadata } from "next";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { getCmsPage } from "@/app/(site)/_lib/cms";
import { fallbackPage } from "@/app/(site)/_lib/fallback";
import { buildPageMetadata, resolveSiteSeo } from "@/app/(site)/_lib/seo";
import { getSiteSettings } from "@/lib/settings";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    getCmsPage("home").then((cms) => cms ?? fallbackPage("home")),
    getSiteSettings(),
  ]);
  // Trang chủ: tiêu đề SEO riêng (Admin → Trang) > Tiêu đề website (Admin → Cài đặt).
  // Không dùng page.title vì đó là tên nội bộ ("Home") và không gắn đuôi tên brand.
  return buildPageMetadata({
    title: page.metaTitle?.trim() || resolveSiteSeo(settings).title,
    absoluteTitle: true,
    description: page.metaDescription ?? page.lead,
    path: siteRoutes.home,
    image: page.ogImagePath,
    canonical: page.canonicalUrl,
  });
}

/**
 * Trang chủ — hiển thị đúng các section của trang "home" trong CMS (Admin → Page
 * Sections): section đang bật, theo thứ tự admin. Xoá / tắt section = khối biến mất.
 * API lỗi → bản dự phòng sinh từ seed (src/content/cms-fallback.json).
 */
export default async function HomePage() {
  const page = (await getCmsPage("home")) ?? fallbackPage("home");
  return <PageSections page={page} />;
}

import type { Metadata } from "next";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { getCmsPage } from "@/app/(site)/_lib/cms";
import { fallbackPage } from "@/app/(site)/_lib/fallback";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getCmsPage("home")) ?? fallbackPage("home");
  return buildPageMetadata({
    title: page.metaTitle ?? page.title,
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

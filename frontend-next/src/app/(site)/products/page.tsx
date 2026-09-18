import type { Metadata } from "next";
import Link from "next/link";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { CtaBand, PageHero } from "@/app/(site)/_components/ui";
import { getCmsPage, heroImageUrl } from "@/app/(site)/_lib/cms";
import { fallbackPage } from "@/app/(site)/_lib/fallback";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getCmsPage("products")) ?? fallbackPage("products");
  return buildPageMetadata({
    title: page.metaTitle?.trim() || page.title,
    description: page.metaDescription ?? page.lead,
    path: siteRoutes.products,
    image: page.ogImagePath,
    canonical: page.canonicalUrl,
  });
}

/**
 * Trang Products — banner + các section đang bật của trang "products" trong CMS
 * (theo thứ tự admin; xoá / tắt = ẩn) + dải CTA cuối trang.
 * API lỗi → bản dự phòng sinh từ seed (src/content/cms-fallback.json).
 */
export default async function ProductsPage() {
  const page = (await getCmsPage("products")) ?? fallbackPage("products");

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
        image={heroImageUrl(page.heroImagePath)}
        imagePosition={page.heroImagePosition}
      />

      <PageSections page={page} />

      <CtaBand
        eyebrow="Sẵn sàng đặt hàng?"
        title="Nhận thông số chi tiết hoặc báo giá"
        text="Cho chúng tôi biết sản phẩm, quy cách, số lượng, đóng gói và nơi nhận hàng — đội ngũ sẽ phản hồi kèm khả năng cung ứng và giá hiện tại."
      >
        <Link href={siteRoutes.contact} className="btn btn-gold">
          Nhận báo giá B2B
        </Link>
        <Link
          href={siteRoutes.homeSection("about-map")}
          className="btn btn-ghost"
        >
          Về chúng tôi
        </Link>
      </CtaBand>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { getCmsPage } from "@/app/(site)/_lib/cms";
import { fallbackPage } from "@/app/(site)/_lib/fallback";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getCmsPage("products")) ?? fallbackPage("products");
  return buildPageMetadata({
    title: page.metaTitle ?? page.title,
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
      <section className="page-hero">
        <div className="container page-hero-inner">
          {page.eyebrow ? <p className="eyebrow eyebrow-gold reveal">{page.eyebrow}</p> : null}
          <h1 className="reveal">{page.title}</h1>
          {page.lead ? <p className="lead reveal">{page.lead}</p> : null}
        </div>
      </section>

      <PageSections page={page} />

      <section className="cta-band">
        <div className="container reveal">
          <p className="eyebrow eyebrow-gold">Ready to Order?</p>
          <h2>Request Specifications or a Commercial Quotation</h2>
          <p>
            Tell us your variety, size, volume, packaging, and destination — our team will
            respond with current availability and pricing.
          </p>
          <div className="cta-band-actions">
            <Link href={siteRoutes.contact} className="btn btn-gold">Request a B2B Quote</Link>
            <Link href={siteRoutes.homeSection("about-map")} className="btn btn-ghost">About Prime Nuts USA</Link>
          </div>
        </div>
      </section>
    </>
  );
}

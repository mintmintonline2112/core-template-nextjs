import type { Metadata } from "next";
import Link from "next/link";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import {
  KernelSizes,
  NaturalAlmonds,
  ProcessedAlmonds,
} from "@/app/(site)/_components/sections";
import { getCmsPage } from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("products");
  return buildPageMetadata({
    title: page?.metaTitle ?? "Our Products",
    description:
      page?.metaDescription ??
      "Natural and processed California almonds — Nonpareil, Independence, Monterey, Carmel, Butte, Padre kernels plus blanched, sliced, slivered, diced almonds and almond flour.",
    path: siteRoutes.products,
    image: page?.ogImagePath,
    canonical: page?.canonicalUrl,
  });
}

/** Bộ khối mặc định — chỉ dùng khi API lỗi hoặc CMS chưa có trang "products". */
const DEFAULT_SECTIONS = [NaturalAlmonds, ProcessedAlmonds, KernelSizes];

/**
 * Trang Products — banner + các section đang bật của trang "products" trong CMS
 * (theo thứ tự admin; xoá / tắt = ẩn) + dải CTA cuối trang.
 */
export default async function ProductsPage() {
  const page = await getCmsPage("products");

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="eyebrow eyebrow-gold reveal">{page?.eyebrow ?? "California Almonds"}</p>
          <h1 className="reveal">{page?.title ?? "Our Products"}</h1>
          <p className="lead reveal">
            {page?.lead ??
              "We source California almonds based on customer requirements, applications, and market demand — from natural kernels to processed formats for food manufacturing."}
          </p>
        </div>
      </section>

      <PageSections page={page} defaults={DEFAULT_SECTIONS} />

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

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SectionRenderer } from "@/components/site/SectionRenderer";
import { getCmsPage } from "@/lib/cms";

/**
 * Trang CMS tự do: mọi Page admin tạo thêm (ngoài 4 trang chuẩn) render tại
 * /<slug>. Mỗi section là một COMPONENT tái sử dụng (SectionRenderer đọc
 * metadata._component / sectionKey): slider, bản đồ, thẻ lý do, số liệu,
 * marquee, form báo giá… — không khớp loại nào thì hiển thị khối generic.
 */

const RESERVED_SLUGS = new Set(["home", "products", "news", "contact"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return {};
  const page = await getCmsPage(slug);
  if (!page) return { title: "Page not found" };
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? page.lead ?? undefined,
  };
}

export default async function CmsGenericPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "home") redirect("/");
  if (RESERVED_SLUGS.has(slug)) notFound();

  const page = await getCmsPage(slug);
  if (!page) notFound();

  const sections = (page.sections ?? [])
    .filter((section) => section.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          {page.eyebrow ? (
            <p className="eyebrow eyebrow-gold reveal">{page.eyebrow}</p>
          ) : null}
          <h1 className="reveal">{page.title}</h1>
          {page.lead ? <p className="lead reveal">{page.lead}</p> : null}
        </div>
      </section>

      {sections.map((section, index) => (
        <SectionRenderer key={section.id} section={section} index={index} />
      ))}

      {sections.length === 0 ? (
        <section className="section">
          <div className="container">
            <p className="section-note reveal">
              This page has no content yet — add sections in the CMS.
            </p>
          </div>
        </section>
      ) : null}

      <section className="cta-band">
        <div className="container reveal">
          <p className="eyebrow eyebrow-gold">Work With Us</p>
          <h2>Looking for California Almond Supply?</h2>
          <p>Tell us your requirements and our team will prepare a commercial quotation.</p>
          <div className="cta-band-actions">
            <Link href="/contact" className="btn btn-gold">Request a B2B Quote</Link>
            <Link href="/products" className="btn btn-ghost">Browse Our Products</Link>
          </div>
        </div>
      </section>
    </>
  );
}

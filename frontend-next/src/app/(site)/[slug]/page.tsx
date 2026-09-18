import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SectionRenderer } from "@/app/(site)/_components/SectionRenderer";
import {
  CtaBand,
  PageHero,
  SECTION,
  SECTION_NOTE,
} from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import { getCmsPage, heroImageUrl } from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

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
  if (!page) return { title: "Page not found", robots: { index: false } };
  return buildPageMetadata({
    title: page.metaTitle?.trim() || page.title,
    description: page.metaDescription ?? page.lead,
    path: siteRoutes.page(page.slug),
    image: page.ogImagePath,
    canonical: page.canonicalUrl,
  });
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
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
        image={heroImageUrl(page.heroImagePath)}
        imagePosition={page.heroImagePosition}
      />

      {sections.map((section, index) => (
        <SectionRenderer key={section.id} section={section} index={index} />
      ))}

      {sections.length === 0 ? (
        <section className={SECTION}>
          <div className="site-container">
            <p className={cn(SECTION_NOTE, "reveal")}>
              This page has no content yet — add sections in the CMS.
            </p>
          </div>
        </section>
      ) : null}

      <CtaBand
        eyebrow="Work With Us"
        title="Looking for a Reliable Supplier?"
        text="Tell us your requirements and our team will prepare a commercial quotation."
      >
        <Link href={siteRoutes.contact} className="btn btn-gold">
          Request a B2B Quote
        </Link>
        <Link href={siteRoutes.products} className="btn btn-ghost">
          Browse Our Products
        </Link>
      </CtaBand>
    </>
  );
}

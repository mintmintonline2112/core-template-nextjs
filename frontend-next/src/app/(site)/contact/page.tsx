import type { Metadata } from "next";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { ContactDetails, QuoteChecklist } from "@/app/(site)/_components/sections";
import { getCmsPage } from "@/app/(site)/_lib/cms";
import { getSiteSettings } from "@/lib/settings";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("contact");
  return buildPageMetadata({
    title: page?.metaTitle ?? "Contact",
    description:
      page?.metaDescription ??
      "Contact Prime Nuts USA for California almond supply — B2B inquiries, quotations, and distribution partnerships.",
    path: siteRoutes.contact,
    image: page?.ogImagePath,
    canonical: page?.canonicalUrl,
  });
}

/** Bộ khối mặc định — chỉ dùng khi API lỗi hoặc CMS chưa có trang "contact". */
const DEFAULT_SECTIONS = [ContactDetails, QuoteChecklist];

/**
 * Trang Contact — banner (Admin → Trang Liên hệ) + các section đang bật của trang
 * "contact" trong CMS (theo thứ tự admin; xoá / tắt = ẩn).
 */
export default async function ContactPage() {
  const [page, settings] = await Promise.all([getCmsPage("contact"), getSiteSettings()]);
  const hero = settings.contactPage?.hero ?? {};

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="eyebrow eyebrow-gold reveal">{hero.eyebrow?.trim() || "Contact Us"}</p>
          <h1 className="reveal">{hero.title?.trim() || "Let’s Talk Almonds"}</h1>
          <p className="lead reveal">
            {hero.lead?.trim() ??
              page?.lead ??
              "Whether you are an established importer or developing a new market for California almonds, our team is ready to review your requirements and respond with current availability."}
          </p>
        </div>
      </section>

      <PageSections page={page} defaults={DEFAULT_SECTIONS} />
    </>
  );
}

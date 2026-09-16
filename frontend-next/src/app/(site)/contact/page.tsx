import type { Metadata } from "next";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { getCmsPage } from "@/app/(site)/_lib/cms";
import { fallbackPage } from "@/app/(site)/_lib/fallback";
import { getSiteSettings } from "@/lib/settings";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getCmsPage("contact")) ?? fallbackPage("contact");
  return buildPageMetadata({
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? page.lead,
    path: siteRoutes.contact,
    image: page.ogImagePath,
    canonical: page.canonicalUrl,
  });
}

/**
 * Trang Contact — banner (Admin → Trang Liên hệ, trống thì lấy của trang CMS) +
 * các section đang bật của trang "contact" (theo thứ tự admin; xoá / tắt = ẩn).
 * API lỗi → bản dự phòng sinh từ seed (src/content/cms-fallback.json).
 */
export default async function ContactPage() {
  const [cmsPage, settings] = await Promise.all([getCmsPage("contact"), getSiteSettings()]);
  const page = cmsPage ?? fallbackPage("contact");
  const hero = settings.contactPage?.hero ?? {};
  const eyebrow = hero.eyebrow?.trim() || page.eyebrow;
  const lead = hero.lead?.trim() || page.lead;

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          {eyebrow ? <p className="eyebrow eyebrow-gold reveal">{eyebrow}</p> : null}
          <h1 className="reveal">{hero.title?.trim() || page.title}</h1>
          {lead ? <p className="lead reveal">{lead}</p> : null}
        </div>
      </section>

      <PageSections page={page} />
    </>
  );
}

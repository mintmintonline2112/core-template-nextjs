import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/app/(site)/_components/forms";
import { getCmsPage, sectionMap } from "@/app/(site)/_lib/cms";
import { getSiteSettings, resolveContact } from "@/lib/settings";
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

const CHECKLIST = [
  "Almond Variety", "Size & Grade", "Required Volume", "Packaging",
  "Destination Country & Port", "Preferred Incoterm", "Target Shipment Window",
  "Certifications Required",
];

export default async function ContactPage() {
  // Nội dung sửa được từ admin; API tắt → fallback hardcode.
  const [page, settings] = await Promise.all([getCmsPage("contact"), getSiteSettings()]);
  const sections = sectionMap(page);
  // Admin → Trang Liên hệ (contactPage.company); ô nào trống thì dùng mặc định
  // trong src/config/contact.ts. Không đọc metadata CMS cũ vì dữ liệu đã hết hiệu lực.
  const info = resolveContact(settings);
  const hero = settings.contactPage?.hero ?? {};
  const checklistSection = sections.get("quotation-checklist");
  const checklist =
    ((checklistSection?.metadata?.checklist as string[] | undefined) ?? CHECKLIST).filter(Boolean);

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="eyebrow eyebrow-gold reveal">{hero.eyebrow?.trim() || "Contact Us"}</p>
          <h1 className="reveal">{hero.title?.trim() || "Let\u2019s Talk Almonds"}</h1>
          <p className="lead reveal">
            {hero.lead?.trim() ??
              page?.lead ??
              "Whether you are an established importer or developing a new market for California almonds, our team is ready to review your requirements and respond with current availability."}
          </p>
        </div>
      </section>

      <section className="section" id="contact-form-section">
        <div className="container contact-grid">
          <div className="reveal">
            <p className="eyebrow">
              {sections.get("contact-info")?.subheading ?? "Get in Touch"}
            </p>
            {/* Tên công ty ở Admin → Trang Liên hệ ưu tiên hơn tiêu đề section CMS cũ. */}
            <h2>
              {settings.contactPage?.company?.name?.trim() ||
                sections.get("contact-info")?.heading ||
                info.name}
            </h2>
            <p className="section-intro">
              We work with commercial buyers — importers, distributors, wholesalers, food
              manufacturers, roasters, and private-label brands.
            </p>

            <ul className="contact-info-list">
              <li>
                <span className="icon-badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" />
                  </svg>
                </span>
                <div>
                  <h4>Location</h4>
                  <p>{info.location}</p>
                </div>
              </li>
              <li>
                <span className="icon-badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 21V8l8-5 8 5v13" /><path d="M8 21v-8h8v8M3 21h18" />
                  </svg>
                </span>
                <div>
                  <h4>Address</h4>
                  <p>{info.address}</p>
                </div>
              </li>
              <li>
                <span className="icon-badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 7 8.5-7" />
                  </svg>
                </span>
                <div>
                  <h4>Email</h4>
                  <p><a href={`mailto:${info.email}`}>{info.email}</a></p>
                </div>
              </li>
              <li>
                <span className="icon-badge" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 4h4l1.8 4.5-2.3 1.7a13 13 0 0 0 5.3 5.3l1.7-2.3L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.8 20 4 13.2 3.5 5.6A1.5 1.5 0 0 1 5 4z" />
                  </svg>
                </span>
                <div>
                  <h4>Phone / WhatsApp</h4>
                  <p><a href={info.phoneHref}>{info.phone}</a></p>
                </div>
              </li>
            </ul>

            <p className="contact-note">
              We typically respond to commercial inquiries within 1–2 business days. For the
              fastest quotation, include your target variety, size &amp; grade, volume,
              packaging, destination port, and preferred Incoterm.
            </p>

            <figure className="photo-frame split-photo reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/orchard-rows.jpg" alt="Rows of almond trees in a California orchard" loading="lazy" />
            </figure>
          </div>

          <ContactForm />
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{checklistSection?.subheading ?? "Faster Quotations"}</p>
            <h2>{checklistSection?.heading ?? "Tell Us What You Need"}</h2>
            <p className="section-intro">
              The more detail you share, the faster we can prepare a commercial quotation based
              on current availability and market conditions.
            </p>
          </div>

          <ul className="doc-grid reveal">
            {checklist.map((item) => (
              <li key={item}>
                <span className="doc-check" aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <p className="section-note reveal">
            Prefer a structured form? Use the detailed{" "}
            <Link href={siteRoutes.homeSection('quote')}>B2B quote request form</Link> on our home page.
          </p>
        </div>
      </section>
    </>
  );
}

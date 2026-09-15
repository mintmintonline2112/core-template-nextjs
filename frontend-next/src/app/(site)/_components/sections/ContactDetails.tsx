import { ContactForm } from "@/app/(site)/_components/forms";
import { getSiteSettings, resolveContact } from "@/lib/settings";
import type { StandardSectionProps } from "./section-content";

/**
 * SECTION `contact-details` — trang Contact.
 * Cột trái: tên công ty, địa điểm, địa chỉ, email, điện thoại, ảnh; cột phải: form liên hệ.
 * Thông tin liên hệ lấy từ Admin → Trang Liên hệ (ô trống dùng src/config/contact.ts);
 * CMS chỉ chỉnh eyebrow (subheading) và tiêu đề dự phòng (heading).
 */
export async function ContactDetails({ section }: StandardSectionProps) {
  const settings = await getSiteSettings();
  const info = resolveContact(settings);

  return (
    <section className="section" id={section?.sectionKey ?? "contact-details"}>
      <div className="container contact-grid">
        <div className="reveal">
          <p className="eyebrow">{section?.subheading ?? "Get in Touch"}</p>
          {/* Tên công ty ở Admin → Trang Liên hệ ưu tiên hơn tiêu đề section. */}
          <h2>{settings.contactPage?.company?.name?.trim() || section?.heading || info.name}</h2>
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
  );
}

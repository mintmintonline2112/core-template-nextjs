import { ContactForm } from "@/app/(site)/_components/forms";
import { getSiteSettings, resolveContact } from "@/lib/settings";
import {
  Head,
  ICONS,
  IconBadge,
  InlineNote,
  RichIntro,
  Shell,
  anchorId,
  layoutOf,
  resolveImage,
  str,
  type SectionProps,
} from "./shared";

const LAYOUTS = ["form", "list"] as const;

/**
 * SECTION `contact` — thông tin liên hệ.
 * layout `form`: cột trái tên công ty + địa điểm / địa chỉ / email / điện thoại + ghi
 *                chú + ảnh; cột phải form liên hệ (gửi API thật).
 * layout `list`: đầu khối + danh sách thông tin (không form).
 * Thông tin ưu tiên: metadata của section → Admin → Trang Liên hệ → config mặc định.
 * CMS: heading, subheading, content, metadata.location/address/email/phone,
 * note (ghi chú dưới danh sách), image (ảnh dưới ghi chú, layout form).
 */
export async function Contact({ section, index = 0 }: SectionProps) {
  const id = anchorId(section, "contact");
  const settings = await getSiteSettings();
  const base = resolveContact(settings);
  const info = {
    location: str(section, "location") ?? base.location,
    address: str(section, "address") ?? base.address,
    email: str(section, "email") ?? base.email,
    phone: str(section, "phone") ?? base.phone,
  };
  const phoneHref = `tel:${info.phone.replace(/[^\d+]/g, "")}`;

  const rows = [
    { key: "location", label: "Location", icon: ICONS.pin, body: info.location },
    { key: "address", label: "Address", icon: ICONS.building, body: info.address },
    { key: "email", label: "Email", icon: ICONS.mail, body: <a href={`mailto:${info.email}`}>{info.email}</a> },
    { key: "phone", label: "Phone / WhatsApp", icon: ICONS.phone, body: <a href={phoneHref}>{info.phone}</a> },
  ].filter((row) => row.body);

  const list = (
    <ul className="contact-info-list">
      {rows.map((row) => (
        <li key={row.key}>
          <IconBadge>{row.icon}</IconBadge>
          <div>
            <h4>{row.label}</h4>
            <p>{row.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );

  if (layoutOf(section, LAYOUTS, "form") === "list") {
    return (
      <Shell tint={index % 2 === 1} id={id}>
        <Head section={section} />
        <div className="reveal" style={{ maxWidth: "34rem" }}>{list}</div>
        <InlineNote text={str(section, "note")} className="contact-note" />
      </Shell>
    );
  }

  const image = str(section, "image");
  // Tên công ty ở Admin → Trang Liên hệ ưu tiên hơn tiêu đề section.
  const title = settings.contactPage?.company?.name?.trim() || section?.heading || base.name;

  return (
    <section className="section" id={id}>
      <div className="container contact-grid">
        <div className="reveal">
          {section?.subheading ? <p className="eyebrow">{section.subheading}</p> : null}
          <h2>{title}</h2>
          <RichIntro html={section?.content} />

          {list}

          <InlineNote text={str(section, "note")} className="contact-note" />

          {image ? (
            <figure className="photo-frame split-photo reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImage(image)} alt={str(section, "imageAlt") ?? ""} loading="lazy" />
            </figure>
          ) : null}
        </div>

        <ContactForm />
      </div>
    </section>
  );
}

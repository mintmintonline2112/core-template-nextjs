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
    {
      key: "location",
      label: "Location",
      icon: ICONS.pin,
      body: info.location,
    },
    {
      key: "address",
      label: "Address",
      icon: ICONS.building,
      body: info.address,
    },
    {
      key: "email",
      label: "Email",
      icon: ICONS.mail,
      body: <a href={`mailto:${info.email}`}>{info.email}</a>,
    },
    {
      key: "phone",
      label: "Phone / WhatsApp",
      icon: ICONS.phone,
      body: <a href={phoneHref}>{info.phone}</a>,
    },
  ].filter((row) => row.body);

  const list = (
    <ul className="mb-[1.8rem]! flex flex-col gap-[0.9rem]">
      {rows.map((row) => (
        <li
          className="group flex items-start gap-[1.1rem] rounded-lg border border-line bg-paper px-[1.4rem] py-[1.2rem] shadow-soft"
          key={row.key}
        >
          <IconBadge className="icon-badge group-hover:scale-110 group-hover:rotate-[-5deg]">
            {row.icon}
          </IconBadge>
          <div>
            <h4 className="m-0! mb-[0.15rem]! text-[1.15rem]">{row.label}</h4>
            <p className="m-0 text-base text-ink-soft [&_a]:border-b [&_a]:border-gold-400 [&_a:hover]:text-gold-500!">
              {row.body}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );

  // Style bằng Tailwind. `.contact-info-list li:hover .icon-badge` (site.css) đổi
  // thành `group`/`group-hover:` ngay trên IconBadge — .icon-badge (hạ tầng dùng
  // chung) vẫn giữ nguyên className, chỉ thêm hiệu ứng hover riêng cho khối này.
  const note = (
    <InlineNote
      text={str(section, "note")}
      className="rounded-r border-l-2 border-gold-400 bg-navy-50 px-[1.3rem] py-[1.1rem] text-base text-ink-soft italic"
    />
  );

  if (layoutOf(section, LAYOUTS, "form") === "list") {
    return (
      <Shell tint={index % 2 === 1} id={id}>
        <Head section={section} />
        <div className="reveal" style={{ maxWidth: "34rem" }}>
          {list}
        </div>
        {note}
      </Shell>
    );
  }

  const image = str(section, "image");
  // Tên công ty ở Admin → Trang Liên hệ ưu tiên hơn tiêu đề section.
  const title =
    settings.contactPage?.company?.name?.trim() ||
    section?.heading ||
    base.name;

  return (
    <section className="section" id={id}>
      <div className="container grid grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] items-start gap-[clamp(2.5rem,6vw,4.5rem)]">
        <div className="reveal">
          {section?.subheading ? (
            <p className="eyebrow">{section.subheading}</p>
          ) : null}
          <h2>{title}</h2>
          <RichIntro html={section?.content} />

          {list}

          {note}

          {image ? (
            <figure className="photo-frame reveal mt-8 aspect-16/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImage(image)}
                alt={str(section, "imageAlt") ?? ""}
                loading="lazy"
              />
            </figure>
          ) : null}
        </div>

        <ContactForm />
      </div>
    </section>
  );
}

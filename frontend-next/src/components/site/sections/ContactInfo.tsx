import { CARD_ICONS, Head, IconBadge, Shell, meta, type SectionProps } from "./shared";

/** Thẻ thông tin liên hệ — metadata {location,email,phone,businessHours}. */
export function ContactInfo({ section, index }: SectionProps) {
  const m = meta(section);
  const fields: Array<{ name: string; label: string; icon: React.ReactNode }> = [
    { name: "location", label: "Location", icon: CARD_ICONS[0] },
    { name: "email", label: "Email", icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 7 8.5-7" /></> },
    { name: "phone", label: "Phone / WhatsApp", icon: <path d="M5 4h4l1.8 4.5-2.3 1.7a13 13 0 0 0 5.3 5.3l1.7-2.3L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.8 20 4 13.2 3.5 5.6A1.5 1.5 0 0 1 5 4z" /> },
    { name: "businessHours", label: "Business Hours", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></> },
  ];
  const rows = fields.filter((f) => typeof m[f.name] === "string" && m[f.name]);
  return (
    <Shell tint={index % 2 === 1} id={section.sectionKey}>
      <Head section={section} />
      <ul className="contact-info-list reveal" style={{ maxWidth: "34rem" }}>
        {rows.map((field) => (
          <li key={field.name}>
            <IconBadge>{field.icon}</IconBadge>
            <div>
              <h4>{field.label}</h4>
              <p>{m[field.name] as string}</p>
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

import { ALMOND_ICON, Head, IconBadge, Shell, meta, strings, type SectionProps } from "./shared";

/** Lưới thẻ tên (icon hạnh nhân) — metadata.varieties [] hoặc metadata.formats []. */
export function NameCards({ section, index }: SectionProps) {
  const m = meta(section);
  const varieties = strings(m, "varieties");
  const names = varieties.length > 0 ? varieties : strings(m, "formats");
  return (
    <Shell tint={index % 2 === 1} id={section.sectionKey}>
      <Head section={section} />
      <div className="why-grid">
        {names.map((name) => (
          <article className="why-card reveal" key={name}>
            <IconBadge>{ALMOND_ICON}</IconBadge>
            <h3>{name}</h3>
          </article>
        ))}
      </div>
    </Shell>
  );
}

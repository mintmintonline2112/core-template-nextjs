import { CARD_ICONS, Head, IconBadge, Shell, items, meta, type SectionProps } from "./shared";

/** Lưới thẻ lý do — metadata.reasons [{title,text}] (icon xoay vòng theo thiết kế). */
export function WhyCards({ section, index }: SectionProps) {
  const reasons = items(meta(section), "reasons").filter((r) => r.title);
  return (
    <Shell tint={index % 2 === 1} id={section.sectionKey}>
      <Head section={section} />
      <div className="why-grid">
        {reasons.map((reason, i) => (
          <article className="why-card reveal" key={reason.title}>
            <IconBadge>{CARD_ICONS[i % CARD_ICONS.length]}</IconBadge>
            <h3>{reason.title}</h3>
            {reason.text ? <p>{reason.text}</p> : null}
          </article>
        ))}
      </div>
    </Shell>
  );
}

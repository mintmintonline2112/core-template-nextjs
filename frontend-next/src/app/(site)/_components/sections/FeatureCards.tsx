import { Head, IconBadge, anchorId, iconFor, items, type SectionProps } from "./shared";

/**
 * SECTION `feature-cards` — lưới thẻ icon + tiêu đề + mô tả (nền kem, class .why-us).
 * CMS: heading, subheading, content, metadata.items [{title,text,icon}]
 * (icon: tên trong bộ icon chung; trống thì xoay vòng theo thứ tự thẻ).
 */
export function FeatureCards({ section }: SectionProps) {
  const cards = items(section, "items").filter((card) => card.title);

  return (
    <section className="section section-tint why-us" id={anchorId(section, "feature-cards")}>
      <div className="container">
        <Head section={section} />

        {cards.length > 0 ? (
          <div className="why-grid">
            {cards.map((card, index) => (
              <article className="why-card reveal" key={`${card.title}-${index}`}>
                <IconBadge>{iconFor(card.icon, index)}</IconBadge>
                <h3>{card.title}</h3>
                {card.text ? <p>{card.text}</p> : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

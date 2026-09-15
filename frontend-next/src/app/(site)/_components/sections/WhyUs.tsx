import { IconBadge } from "./shared";
import { metaOf, type StandardSectionProps } from "./section-content";

// Lý do mặc định — icon giữ theo thứ tự thẻ.
const REASONS = [
  { title: "California-Based Sourcing", text: "Our location in California allows us to communicate efficiently with suppliers, processors, and logistics partners operating within the almond supply chain.", icon: <><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></> },
  { title: "Multiple Supply Options", text: "We are not limited to a single variety or supply source. This allows us to evaluate different options according to each buyer’s specifications, volume, destination, and commercial requirements.", icon: <><path d="M4 21v-4M4 13v-2M4 7V3M12 21v-8M12 9V3M20 21v-2M20 15V3" /><circle cx="4" cy="15" r="2" /><circle cx="12" cy="11" r="2" /><circle cx="20" cy="17" r="2" /></> },
  { title: "Buyer-Focused Procurement", text: "We begin with your requirements and source accordingly. Our goal is to find supply that fits your market—not to push a predetermined product.", icon: <><path d="M12 4v16M5 8l7-4 7 4" /><path d="M5 8l-2.5 6a3.5 3.5 0 0 0 7 0L7 8M19 8l-2.5 6a3.5 3.5 0 0 0 7 0L21 8" /><path d="M8 20h8" /></> },
  { title: "Export Coordination", text: "We assist with the commercial, documentation, and logistics coordination needed to move California almonds to international destinations.", icon: <path d="M3 17h18l-2 4H5l-2-4zM6 17V9l4-2v10M14 17V7l4 2v8" /> },
  { title: "Long-Term Supply Relationships", text: "Our focus extends beyond individual transactions. We aim to build dependable sourcing relationships with qualified buyers who require consistent access to California almond supply.", icon: <path d="M12 21c-5-3.5-8-7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 4-3 7.5-8 11z" /> },
];

/**
 * SECTION `why-us` — trang Home.
 * Lưới thẻ lý do nền navy (class .why-us trong site.css).
 * CMS: heading, subheading, metadata.reasons [{title,text}].
 */
export function WhyUs({ section }: StandardSectionProps) {
  const reasons = (metaOf<Array<{ title?: string; text?: string }>>(section, "reasons") ?? REASONS)
    .filter((reason) => reason.title);

  return (
    <section className="section section-tint why-us" id={section?.sectionKey ?? "why-us"}>
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow">{section?.subheading ?? "Why Choose Us"}</p>
          <h2>{section?.heading ?? "Why Prime Nuts USA?"}</h2>
        </div>

        <div className="why-grid">
          {reasons.map((reason, index) => (
            <article className="why-card reveal" key={reason.title}>
              <IconBadge>{REASONS[index % REASONS.length].icon}</IconBadge>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

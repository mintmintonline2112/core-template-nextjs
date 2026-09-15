import { RichIntro, metaOf, type StandardSectionProps } from "./section-content";

type FaqItem = { question: string; answer: string; group?: string };
type FaqColumn = { title?: string; items: FaqItem[] };

// Nội dung mặc định — 5 lý do "Why Prime Nuts USA?" (câu hỏi = tiêu đề, trả lời = mô tả).
const DEFAULT_ITEMS: FaqItem[] = [
  { question: "California-Based Sourcing", answer: "Our location in California allows us to communicate efficiently with suppliers, processors, and logistics partners operating within the almond supply chain." },
  { question: "Multiple Supply Options", answer: "We are not limited to a single variety or supply source. This allows us to evaluate different options according to each buyer’s specifications, volume, destination, and commercial requirements." },
  { question: "Buyer-Focused Procurement", answer: "We begin with your requirements and source accordingly. Our goal is to find supply that fits your market—not to push a predetermined product." },
  { question: "Export Coordination", answer: "We assist with the commercial, documentation, and logistics coordination needed to move California almonds to international destinations." },
  { question: "Long-Term Supply Relationships", answer: "Our focus extends beyond individual transactions. We aim to build dependable sourcing relationships with qualified buyers who require consistent access to California almond supply." },
];

/** Có tên nhóm → mỗi nhóm một cột có tiêu đề; không có → chia đều 2 cột. */
function toColumns(items: FaqItem[]): FaqColumn[] {
  if (items.some((item) => item.group)) {
    const columns: FaqColumn[] = [];
    for (const item of items) {
      const title = item.group ?? "";
      let column = columns.find((entry) => (entry.title ?? "") === title);
      if (!column) {
        column = { title: title || undefined, items: [] };
        columns.push(column);
      }
      column.items.push(item);
    }
    return columns;
  }
  const half = Math.ceil(items.length / 2);
  return [{ items: items.slice(0, half) }, { items: items.slice(half) }].filter((column) => column.items.length > 0);
}

/** Tiêu đề có một phần tô màu (phần đó phải nằm trong tiêu đề). */
function AccentHeading({ text, accent }: { text: string; accent?: string }) {
  const at = accent ? text.lastIndexOf(accent) : -1;
  if (!accent || at < 0) return <h2>{text}</h2>;
  return (
    <h2>
      {text.slice(0, at)}
      <span className="faq-accent">{accent}</span>
      {text.slice(at + accent.length)}
    </h2>
  );
}

/**
 * SECTION `faq` — accordion 2 cột: mỗi câu là một thẻ trắng viền trái có dấu +,
 * bấm để mở câu trả lời (thẻ <details> gốc — không cần JavaScript).
 * CMS: subheading (dòng nhỏ), heading, content (đoạn dẫn), metadata.headingAccent
 * (phần tiêu đề tô màu), metadata.items [{question, answer, group}].
 */
export function Faq({ section }: StandardSectionProps) {
  const cmsItems = metaOf<Array<{ question?: string; answer?: string; group?: string }>>(section, "items")
    ?.filter((item) => item.question?.trim())
    .map((item) => ({
      question: item.question!.trim(),
      answer: item.answer?.trim() ?? "",
      group: item.group?.trim() || undefined,
    }));
  const items = cmsItems && cmsItems.length > 0 ? cmsItems : DEFAULT_ITEMS;
  const columns = toColumns(items);

  return (
    <section className="section section-tint faq" id={section?.sectionKey ?? "faq"}>
      <div className="container">
        <div className="faq-head reveal">
          <p className="faq-eyebrow">{section?.subheading ?? "Why Choose Us"}</p>
          <AccentHeading
            text={section?.heading ?? "Why Prime Nuts USA?"}
            accent={metaOf<string>(section, "headingAccent") ?? "Prime Nuts USA?"}
          />
          <RichIntro html={section?.content} className="faq-intro" />
        </div>

        <div className="faq-columns">
          {columns.map((column, columnIndex) => (
            <div className="faq-column reveal" key={column.title ?? columnIndex}>
              {column.title ? <h3 className="faq-group-title">{column.title}</h3> : null}
              <div className="faq-list">
                {column.items.map((item) => (
                  <details className="faq-item" key={item.question}>
                    <summary className="faq-question">
                      <span className="faq-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                      <span>{item.question}</span>
                    </summary>
                    {item.answer ? (
                      <div className="faq-answer">
                        {item.answer.split(/\n{2,}/).map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    ) : null}
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

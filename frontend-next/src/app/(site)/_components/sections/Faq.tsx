import { RichIntro, anchorId, items, layoutOf, paragraphs, resolveImage, str, type SectionProps } from "./shared";

const LAYOUTS = ["columns", "split"] as const;

type FaqItem = { question: string; answer: string; group?: string };
type FaqColumn = { title?: string; items: FaqItem[] };

/** Có tên nhóm → mỗi nhóm một cột có tiêu đề; không có → chia đều 2 cột. */
function toColumns(list: FaqItem[]): FaqColumn[] {
  if (list.some((item) => item.group)) {
    const columns: FaqColumn[] = [];
    for (const item of list) {
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
  const half = Math.ceil(list.length / 2);
  return [{ items: list.slice(0, half) }, { items: list.slice(half) }].filter((column) => column.items.length > 0);
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

const Answer = ({ text, className }: { text: string; className: string }) =>
  text ? (
    <div className={className}>
      {paragraphs(text).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  ) : null;

/**
 * SECTION `faq` — accordion câu hỏi (thẻ <details> gốc, không cần JavaScript).
 * layout `columns`: thẻ trắng viền trái có dấu +, tự chia 2 cột hoặc theo nhóm.
 * layout `split`:   chữ + accordion 1 cột bên trái (dấu + bên phải), ảnh lớn bo
 *                   góc bên phải, dòng ghi chú cuối cột.
 * CMS: subheading, heading, content, metadata.items [{question,answer,group}],
 * headingAccent (columns), image / imageAlt / imageSide ('left') / note (split).
 */
export function Faq({ section }: SectionProps) {
  const id = anchorId(section, "faq");
  const list: FaqItem[] = items(section, "items")
    .filter((item) => item.question)
    .map((item) => ({ question: item.question, answer: item.answer ?? "", group: item.group }));

  if (layoutOf(section, LAYOUTS, "columns") === "split") {
    const image = str(section, "image");
    const flipped = str(section, "imageSide")?.toLowerCase() === "left";
    const note = str(section, "note");
    return (
      <section className={`section faq-split${flipped ? " is-flipped" : ""}`} id={id}>
        <div className="container fs-inner">
          <div className="fs-text reveal">
            {section?.subheading ? <p className="fs-eyebrow">{section.subheading}</p> : null}
            {section?.heading ? <h2 className="fs-heading">{section.heading}</h2> : null}
            <RichIntro html={section?.content} className="fs-intro" />

            {list.length > 0 ? (
              <div className="fs-list">
                {list.map((item) => (
                  <details className="fs-item" key={item.question}>
                    <summary className="fs-question">
                      <span>{item.question}</span>
                      <span className="fs-plus" aria-hidden="true" />
                    </summary>
                    <Answer text={item.answer} className="fs-answer" />
                  </details>
                ))}
              </div>
            ) : null}

            {note ? <p className="fs-note">{note}</p> : null}
          </div>

          {image ? (
            <figure className="fs-figure reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImage(image)} alt={str(section, "imageAlt") ?? section?.heading ?? ""} loading="lazy" />
            </figure>
          ) : null}
        </div>
      </section>
    );
  }

  const columns = toColumns(list);
  return (
    <section className="section section-tint faq" id={id}>
      <div className="container">
        {section?.heading || section?.subheading || section?.content ? (
          <div className="faq-head reveal">
            {section?.subheading ? <p className="faq-eyebrow">{section.subheading}</p> : null}
            {section?.heading ? <AccentHeading text={section.heading} accent={str(section, "headingAccent")} /> : null}
            <RichIntro html={section?.content} className="faq-intro" />
          </div>
        ) : null}

        {columns.length > 0 ? (
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
                      <Answer text={item.answer} className="faq-answer" />
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

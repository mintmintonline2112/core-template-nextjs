import { QuoteForm as QuoteFormWidget } from "@/app/(site)/_components/forms";
import { InlineNote, RichIntro, anchorId, str, strings, type SectionProps } from "./shared";

/**
 * SECTION `quote-form` — nền navy: tiêu đề + checklist "Please include" bên trái,
 * form báo giá B2B (gửi API thật) bên phải.
 * CMS: heading, subheading, content, metadata.items [] (checklist), note (dòng cuối).
 */
export function QuoteForm({ section }: SectionProps) {
  const checklist = strings(section, "items");

  return (
    <section className="section quote" id={anchorId(section, "quote-form")}>
      <div className="container quote-inner">
        <div className="quote-copy reveal">
          {section?.subheading ? <p className="eyebrow eyebrow-gold">{section.subheading}</p> : null}
          {section?.heading ? <h2>{section.heading}</h2> : null}
          <RichIntro html={section?.content} />
          {checklist.length > 0 ? (
            <ul className="quote-checklist">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          <InlineNote text={str(section, "note")} className="quote-followup" />
        </div>

        <QuoteFormWidget />
      </div>
    </section>
  );
}

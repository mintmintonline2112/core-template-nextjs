import { QuoteForm } from "@/app/(site)/_components/forms";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { meta, strings, type SectionProps } from "./shared";

/** Khối form báo giá B2B + checklist — metadata.checklist []. Form gửi API thật. */
export function QuoteCta({ section }: SectionProps) {
  const checklist = strings(meta(section), "checklist");
  return (
    <section className="section quote" id={section.sectionKey}>
      <div className="container quote-inner">
        <div className="quote-copy reveal">
          {section.subheading ? (
            <p className="eyebrow eyebrow-gold">{section.subheading}</p>
          ) : null}
          {section.heading ? <h2>{section.heading}</h2> : null}
          {section.content ? (
            <div
              className="section-intro"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(section.content) }}
            />
          ) : null}
          {checklist.length > 0 ? (
            <ul className="quote-checklist">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <QuoteForm />
      </div>
    </section>
  );
}

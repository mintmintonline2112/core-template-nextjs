import { QuoteForm } from "@/app/(site)/_components/forms";
import { RichIntro, metaOf, type StandardSectionProps } from "./section-content";

const DEFAULT_INTRO =
  "<p>Send us your purchasing requirements, and our California sourcing team will review the available supply options.</p>" +
  "<p>Please include:</p>";

const CHECKLIST = [
  "Product or variety", "Grade", "Size", "Quantity", "Packaging",
  "Destination country", "Destination port", "Target shipment date",
  "Incoterm preference", "Special specifications, if applicable",
];

/**
 * SECTION `request-quote` — trang Home (nền navy, cuối trang).
 * Tiêu đề + checklist "Please include" + form báo giá gửi API thật.
 * CMS: heading, subheading, content, metadata.checklist [].
 */
export function RequestQuote({ section }: StandardSectionProps) {
  const checklist = (metaOf<string[]>(section, "checklist") ?? CHECKLIST).filter(Boolean);

  return (
    <section className="section quote" id={section?.sectionKey ?? "request-quote"}>
      <div className="container quote-inner">
        <div className="quote-copy reveal">
          <p className="eyebrow eyebrow-gold">{section?.subheading ?? "Request a Quote"}</p>
          <h2>{section?.heading ?? "Looking for California Almonds?"}</h2>
          <RichIntro html={section?.content ?? DEFAULT_INTRO} />
          <ul className="quote-checklist">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="quote-followup">
            Prime Nuts USA · California, USA — Wholesale and trade inquiries only.
          </p>
        </div>

        <QuoteForm />
      </div>
    </section>
  );
}

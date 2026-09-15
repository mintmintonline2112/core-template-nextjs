import Link from "next/link";
import { siteRoutes } from "@/config/routes";
import { metaOf, type StandardSectionProps } from "./section-content";

const CHECKLIST = [
  "Almond Variety", "Size & Grade", "Required Volume", "Packaging",
  "Destination Country & Port", "Preferred Incoterm", "Target Shipment Window",
  "Certifications Required",
];

/**
 * SECTION `quote-checklist` — trang Contact (nền kem).
 * Lưới checklist những thông tin nên gửi khi yêu cầu báo giá + link tới form trang chủ.
 * CMS: heading, subheading, metadata.checklist [].
 */
export function QuoteChecklist({ section }: StandardSectionProps) {
  const checklist = (metaOf<string[]>(section, "checklist") ?? CHECKLIST).filter(Boolean);

  return (
    <section className="section section-tint" id={section?.sectionKey ?? "quote-checklist"}>
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow">{section?.subheading ?? "Faster Quotations"}</p>
          <h2>{section?.heading ?? "Tell Us What You Need"}</h2>
          <p className="section-intro">
            The more detail you share, the faster we can prepare a commercial quotation based
            on current availability and market conditions.
          </p>
        </div>

        <ul className="doc-grid reveal">
          {checklist.map((item) => (
            <li key={item}>
              <span className="doc-check" aria-hidden="true">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <p className="section-note reveal">
          Prefer a structured form? Use the detailed{" "}
          <Link href={siteRoutes.homeSection("request-quote")}>B2B quote request form</Link> on our home page.
        </p>
      </div>
    </section>
  );
}

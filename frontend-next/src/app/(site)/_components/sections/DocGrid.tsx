import { Head, Shell, items, meta, strings, type SectionProps } from "./shared";

/** Lưới checklist + chip — metadata.documents [{label,note}], metadata.incoterms []. */
export function DocGrid({ section, index }: SectionProps) {
  const m = meta(section);
  const documents = items(m, "documents").filter((d) => d.label);
  const incoterms = strings(m, "incoterms");
  return (
    <Shell tint={index % 2 === 1} id={section.sectionKey}>
      <Head section={section} />
      {documents.length > 0 ? (
        <ul className="doc-grid reveal">
          {documents.map((doc) => (
            <li key={doc.label}>
              <span className="doc-check" aria-hidden="true">✓</span>
              {doc.label}
              {doc.note ? <span className="doc-note">{doc.note}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {incoterms.length > 0 ? (
        <div className="incoterm-band reveal">
          <p>
            Shipping quotations may be available under common international trade terms:
          </p>
          <div className="incoterm-chips">
            {incoterms.map((term) => (
              <span key={term}>{term}</span>
            ))}
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

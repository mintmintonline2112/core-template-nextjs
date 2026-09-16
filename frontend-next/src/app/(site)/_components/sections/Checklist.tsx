import { Cta, Head, anchorId, inlineHtml, str, strings, type SectionProps } from "./shared";

/**
 * SECTION `checklist` — lưới các mục có dấu tick (VD thông tin nên gửi khi yêu cầu
 * báo giá), dưới là dòng ghi chú (có thể chứa link) + nút.
 * CMS: heading, subheading, content, metadata.items [], note, ctaLabel, ctaHref.
 */
export function Checklist({ section }: SectionProps) {
  const list = strings(section, "items");
  const note = str(section, "note");
  const ctaLabel = str(section, "ctaLabel");

  return (
    <section className="section section-tint" id={anchorId(section, "checklist")}>
      <div className="container">
        <Head section={section} />

        {list.length > 0 ? (
          <ul className="doc-grid reveal">
            {list.map((item) => (
              <li key={item}>
                <span className="doc-check" aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {note || ctaLabel ? (
          <p className="section-note reveal">
            {note ? <span dangerouslySetInnerHTML={{ __html: inlineHtml(note) }} /> : null}
            {note && ctaLabel ? <br /> : null}
            <Cta label={ctaLabel} href={str(section, "ctaHref")} className="btn btn-ghost-dark btn-sm" style={{ marginTop: "1rem" }} />
          </p>
        ) : null}
      </div>
    </section>
  );
}

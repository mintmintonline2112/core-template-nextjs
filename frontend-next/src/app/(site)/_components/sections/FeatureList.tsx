import { Head, Shell, anchorId, inlineHtml, items, layoutOf, resolveImage, str, strings, type SectionProps } from "./shared";

const LAYOUTS = ["split", "grid"] as const;

/**
 * SECTION `feature-list` — danh sách mục có ghi chú + dải chip.
 * layout `split`: mục đánh số kẹp hai bên ảnh tròn trung tâm (vòng nét đứt xoay),
 *                 dưới là dải câu mục tiêu + chip.
 * layout `grid`:  lưới mục có dấu tick + dải chip.
 * CMS: heading, subheading, content, metadata.items [{label,note}], chips [],
 * image (ảnh tròn trung tâm), note (câu trong dải chip).
 */
export function FeatureList({ section, index = 0 }: SectionProps) {
  const id = anchorId(section, "feature-list");
  const rows = items(section, "items")
    .map((row) => ({ label: row.label ?? row.title ?? "", note: row.note }))
    .filter((row) => row.label);
  const chips = strings(section, "chips");
  const note = str(section, "note");

  const band =
    note || chips.length > 0 ? (
      <div className="incoterm-band reveal">
        {note ? <p dangerouslySetInnerHTML={{ __html: inlineHtml(note) }} /> : null}
        {chips.length > 0 ? (
          <div className="incoterm-chips">
            {chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        ) : null}
      </div>
    ) : null;

  if (layoutOf(section, LAYOUTS, "split") === "grid") {
    return (
      <Shell tint={index % 2 === 1} id={id}>
        <Head section={section} />
        {rows.length > 0 ? (
          <ul className="doc-grid reveal">
            {rows.map((row) => (
              <li key={row.label}>
                <span className="doc-check" aria-hidden="true">✓</span>
                {row.label}
                {row.note ? <span className="doc-note">{row.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {band}
      </Shell>
    );
  }

  const half = Math.ceil(rows.length / 2);
  const image = str(section, "image");
  const column = (list: typeof rows, offset: number, side: "left" | "right") => (
    <ul className={`doc-col doc-col-${side}`}>
      {list.map((row, i) => (
        <li key={row.label}>
          <span className="doc-num" aria-hidden="true">{String(offset + i + 1).padStart(2, "0")}</span>
          <div className="doc-body">
            <h4>{row.label}</h4>
            {row.note ? <span className="doc-note">{row.note}</span> : null}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="section" id={id}>
      <div className="container">
        <Head section={section} />

        {rows.length > 0 ? (
          <div className="doc-features reveal">
            {column(rows.slice(0, half), 0, "left")}
            <div className="doc-center">
              <div className="doc-center-ring">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveImage(image)} alt="" loading="lazy" />
                ) : null}
              </div>
            </div>
            {column(rows.slice(half), half, "right")}
          </div>
        ) : null}

        {band}
      </div>
    </section>
  );
}

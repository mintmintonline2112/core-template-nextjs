import {
  Cta,
  Head,
  anchorId,
  inlineHtml,
  str,
  strings,
  type SectionProps,
} from "./shared";

/**
 * SECTION `checklist` — lưới các mục có dấu tick (VD thông tin nên gửi khi yêu cầu
 * báo giá), dưới là dòng ghi chú (có thể chứa link) + nút.
 * CMS: heading, subheading, content, metadata.items [], note, ctaLabel, ctaHref.
 *
 * Style bằng Tailwind, nhưng vẫn GIỮ class `doc-grid` trên <ul> (dù đã có class
 * Tailwind tương đương — giá trị copy y hệt CSS cũ nên không lệch): (1) bố cục
 * "Lưới tick" của FeatureList.tsx còn dùng CSS này, xoá khi component đó chuyển
 * xong; (2) SiteEffects.tsx bắt `.doc-grid.reveal` để so le hiệu ứng hiện dần
 * từng dòng — bỏ class là mất hiệu ứng so le dù layout không đổi.
 */
export function Checklist({ section }: SectionProps) {
  const list = strings(section, "items");
  const note = str(section, "note");
  const ctaLabel = str(section, "ctaLabel");

  return (
    <section
      className="section section-tint"
      id={anchorId(section, "checklist")}
    >
      <div className="container">
        <Head section={section} />

        {list.length > 0 ? (
          <ul className="doc-grid reveal grid grid-cols-4 gap-[0.9rem]">
            {list.map((item) => (
              <li
                className="flex flex-wrap items-center gap-[0.8rem] rounded border border-line bg-paper px-[1.2rem] py-[1.05rem] text-[1.02rem] transition-[border-color,transform] duration-200 ease-brand hover:-translate-y-0.5 hover:border-gold-400"
                key={item}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy-100 bg-navy-50 text-[0.8rem] font-bold text-navy-700"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {note || ctaLabel ? (
          <p className="section-note reveal">
            {note ? (
              <span dangerouslySetInnerHTML={{ __html: inlineHtml(note) }} />
            ) : null}
            {note && ctaLabel ? <br /> : null}
            <Cta
              label={ctaLabel}
              href={str(section, "ctaHref")}
              className="btn btn-ghost-dark btn-sm"
              style={{ marginTop: "1rem" }}
            />
          </p>
        ) : null}
      </div>
    </section>
  );
}

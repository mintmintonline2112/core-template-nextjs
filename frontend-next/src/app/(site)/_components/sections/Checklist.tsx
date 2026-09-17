import {
  SECTION,
  SECTION_NOTE,
  SECTION_TINT,
} from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
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
 */
export function Checklist({ section }: SectionProps) {
  const list = strings(section, "items");
  const note = str(section, "note");
  const ctaLabel = str(section, "ctaLabel");

  return (
    <section
      className={cn(SECTION, SECTION_TINT)}
      id={anchorId(section, "checklist")}
    >
      <div className="site-container">
        <Head section={section} />

        {list.length > 0 ? (
          <ul
            data-stagger="70"
            className="reveal reveal-group grid grid-cols-4 gap-4 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1"
          >
            {list.map((item) => (
              <li
                className="flex flex-wrap items-center gap-3 rounded border border-line bg-paper px-5 py-4 text-base hover:-translate-y-0.5 hover:border-gold-400"
                key={item}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy-100 bg-navy-50 text-xs font-bold text-navy-700"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {note || ctaLabel ? (
          <p className={cn(SECTION_NOTE, "reveal")}>
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

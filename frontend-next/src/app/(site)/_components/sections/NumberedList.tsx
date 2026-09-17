import { Eyebrow, SECTION, SECTION_TINT } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Cta,
  RichIntro,
  anchorId,
  inlineHtml,
  showsEyebrow,
  str,
  strings,
  type SectionProps,
} from "./shared";

const pad = (n: number) => String(n + 1).padStart(2, "0");

/**
 * SECTION `numbered-list` — chia đôi: bên trái tiêu đề + giới thiệu + ghi chú
 * (có thể chứa link) + nút, đứng yên khi cuộn trên máy tính; bên phải các mục
 * đánh số 01, 02… chia 2 cột, ngăn bằng đường kẻ mảnh.
 * Cùng dữ liệu với `checklist` nên đổi qua lại không phải nhập lại.
 * CMS: subheading, heading, content, metadata.items [], note, ctaLabel, ctaHref.
 */
export function NumberedList({ section }: SectionProps) {
  const list = strings(section, "items");
  const note = str(section, "note");
  const ctaLabel = str(section, "ctaLabel");

  return (
    <section
      className={cn(SECTION, SECTION_TINT)}
      id={anchorId(section, "numbered-list")}
    >
      <div
        className={cn(
          "site-container grid items-start gap-[clamp(2.5rem,6vw,5.5rem)] max-[900px]:grid-cols-1",
          list.length > 0 && "grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]",
        )}
      >
        <div className="reveal min-[901px]:sticky min-[901px]:top-32">
          {section?.subheading ? (
            <Eyebrow heading show={showsEyebrow(section)}>
              {section.subheading}
            </Eyebrow>
          ) : null}
          {section?.heading ? (
            <h2 className="text-h2">{section.heading}</h2>
          ) : null}
          <RichIntro html={section?.content} />
          {note ? (
            <p
              className="mt-6 mb-0 font-display text-base text-ink-faint italic"
              dangerouslySetInnerHTML={{ __html: inlineHtml(note) }}
            />
          ) : null}
          <Cta
            label={ctaLabel}
            href={str(section, "ctaHref")}
            className="btn btn-ghost-dark btn-sm"
            style={{ marginTop: "1.5rem" }}
          />
        </div>

        {list.length > 0 ? (
          <ol
            data-stagger="60"
            className="reveal reveal-group m-0 grid list-none grid-cols-2 gap-x-8 p-0 max-[640px]:grid-cols-1"
          >
            {list.map((item, i) => (
              <li
                key={`${item}-${i}`}
                className="flex items-baseline gap-4 border-b border-line py-5 max-[640px]:first:border-t min-[641px]:nth-[-n+2]:border-t"
              >
                <span
                  aria-hidden="true"
                  className="w-9 shrink-0 font-display text-2xl leading-none font-semibold text-gold-500 tabular-nums"
                >
                  {pad(i)}
                </span>
                <span className="text-lg font-medium text-navy-900">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}

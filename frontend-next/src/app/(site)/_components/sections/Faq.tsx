import { SECTION, SECTION_TINT } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  RichIntro,
  anchorId,
  items,
  layoutOf,
  paragraphs,
  resolveImage,
  str,
  type SectionProps,
} from "./shared";

const LAYOUTS = ["columns", "split"] as const;

type FaqItem = { question: string; answer: string; group?: string };
type FaqColumn = { title?: string; items: FaqItem[] };

/** Có tên nhóm → mỗi nhóm một cột có tiêu đề; không có → chia đều 2 cột. */
function toColumns(list: FaqItem[]): FaqColumn[] {
  if (list.some((item) => item.group)) {
    const columns: FaqColumn[] = [];
    for (const item of list) {
      const title = item.group ?? "";
      let column = columns.find((entry) => (entry.title ?? "") === title);
      if (!column) {
        column = { title: title || undefined, items: [] };
        columns.push(column);
      }
      column.items.push(item);
    }
    return columns;
  }
  const half = Math.ceil(list.length / 2);
  return [{ items: list.slice(0, half) }, { items: list.slice(half) }].filter(
    (column) => column.items.length > 0,
  );
}

/** Tiêu đề có một phần tô màu (phần đó phải nằm trong tiêu đề). */
function AccentHeading({ text, accent }: { text: string; accent?: string }) {
  const at = accent ? text.lastIndexOf(accent) : -1;
  if (!accent || at < 0)
    return <h2 className="mb-[0.5em] text-h2 text-ink">{text}</h2>;
  return (
    <h2 className="mb-[0.5em] text-h2 text-ink">
      {text.slice(0, at)}
      <span className="text-gold-500">{accent}</span>
      {text.slice(at + accent.length)}
    </h2>
  );
}

/**
 * Đoạn trả lời — style `[&_p]` vì nội dung là các <p> chèn thẳng, không đi qua
 * component riêng (câu hỏi ngắn, không cần RichIntro/sanitize rich-text đầy đủ).
 */
const Answer = ({ text, className }: { text: string; className: string }) =>
  text ? (
    <div className={cn(className, "[&_p]:mb-[0.7em] [&_p:last-child]:mb-0")}>
      {paragraphs(text).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  ) : null;

/**
 * SECTION `faq` — accordion câu hỏi (thẻ <details> gốc, không cần JavaScript).
 * layout `columns`: thẻ trắng viền trái có dấu +, tự chia 2 cột hoặc theo nhóm.
 * layout `split`:   chữ + accordion 1 cột bên trái (dấu + bên phải), ảnh lớn bo
 *                   góc bên phải, dòng ghi chú cuối cột.
 * CMS: subheading, heading, content, metadata.items [{question,answer,group}],
 * headingAccent (columns), image / imageAlt / imageSide ('left') / note (split).
 *
 * `open:` / `group-open:` bám theo `<details open>` gốc trình duyệt, không cần state.
 */
export function Faq({ section }: SectionProps) {
  const id = anchorId(section, "faq");
  const list: FaqItem[] = items(section, "items")
    .filter((item) => item.question)
    .map((item) => ({
      question: item.question,
      answer: item.answer ?? "",
      group: item.group,
    }));

  if (layoutOf(section, LAYOUTS, "columns") === "split") {
    const image = str(section, "image");
    const flipped = str(section, "imageSide")?.toLowerCase() === "left";
    const note = str(section, "note");
    return (
      <section className={cn(SECTION, "bg-cream-2")} id={id}>
        <div className="site-container grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-stretch gap-[clamp(2.25rem,5vw,4.5rem)] max-[900px]:grid-cols-1">
          <div
            className={cn(
              "reveal flex flex-col py-[clamp(0.5rem,2vw,1.75rem)]",
              flipped && "order-2",
            )}
          >
            {section?.subheading ? (
              <p className="m-0 font-display text-xs font-semibold tracking-xl text-gold-500 uppercase">
                {section.subheading}
              </p>
            ) : null}
            {section?.heading ? (
              <h2 className="mt-3 mb-0 text-h2 leading-tight text-navy-900">
                {section.heading}
              </h2>
            ) : null}
            <RichIntro
              html={section?.content}
              className="mt-4 max-w-[54ch] leading-loose text-ink-soft [&_p]:mb-[0.65em] [&_p:last-child]:mb-0"
            />

            {list.length > 0 ? (
              <div className="mt-[clamp(1.5rem,3vw,2.25rem)] flex flex-col gap-3">
                {list.map((item) => (
                  <details
                    className="group rounded-2xl bg-paper shadow-soft transition-[box-shadow,transform] duration-[240ms] ease-brand open:shadow-lift hover:-translate-y-px"
                    key={item.question}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5 font-display text-base font-bold text-navy-900 transition-colors duration-200 ease-brand marker:content-none hover:text-navy-600 focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold-500 max-[640px]:gap-4 max-[640px]:px-5 max-[640px]:py-4">
                      <span>{item.question}</span>
                      <span
                        aria-hidden="true"
                        className="relative h-[18px] w-[18px] shrink-0 text-navy-700 transition-colors duration-[220ms] ease-brand group-open:text-gold-500 before:absolute before:top-1/2 before:left-0 before:h-[2px] before:w-full before:-translate-y-1/2 before:rounded-xs before:bg-current before:transition-[transform,opacity] before:duration-[250ms] before:ease-brand before:content-[''] after:absolute after:top-0 after:left-1/2 after:h-full after:w-[2px] after:-translate-x-1/2 after:rounded-xs after:bg-current after:transition-[transform,opacity] after:duration-[200ms] after:ease-brand after:content-[''] group-open:after:scale-y-0 group-open:after:opacity-0"
                      />
                    </summary>
                    <Answer
                      text={item.answer}
                      className="animate-[faq-in_300ms_var(--ease)_both] px-6 pb-5 text-base leading-relaxed text-ink-soft motion-reduce:animate-none max-[640px]:px-5 max-[640px]:pb-5"
                    />
                  </details>
                ))}
              </div>
            ) : null}

            {note ? (
              <p className="mt-auto border-t border-line pt-4 text-xs leading-relaxed text-ink-faint max-[900px]:mt-7">
                {note}
              </p>
            ) : null}
          </div>

          {image ? (
            <figure className="reveal m-0 h-full min-h-[clamp(360px,44vw,620px)] overflow-hidden rounded-3xl bg-navy-800 shadow-soft max-[900px]:min-h-[320px] max-[640px]:min-h-[260px] max-[640px]:rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImage(image)}
                alt={str(section, "imageAlt") ?? section?.heading ?? ""}
                loading="lazy"
                className="block h-full min-h-[inherit] w-full object-cover"
              />
            </figure>
          ) : null}
        </div>
      </section>
    );
  }

  const columns = toColumns(list);
  return (
    <section className={cn(SECTION, SECTION_TINT)} id={id}>
      <div className="site-container">
        {section?.heading || section?.subheading || section?.content ? (
          <div className="reveal mx-auto mb-[clamp(2.5rem,5vw,3.5rem)] max-w-[52rem] text-center">
            {section?.subheading ? (
              <p className="mb-3 text-sm font-semibold tracking-lg text-gold-500 uppercase">
                {section.subheading}
              </p>
            ) : null}
            {section?.heading ? (
              <AccentHeading
                text={section.heading}
                accent={str(section, "headingAccent")}
              />
            ) : null}
            <RichIntro
              html={section?.content}
              className="mx-auto max-w-[46rem] text-ink-soft [&_p]:mb-[0.6em] [&_p:last-child]:mb-0"
            />
          </div>
        ) : null}

        {columns.length > 0 ? (
          <div className="grid grid-cols-2 items-start gap-x-[clamp(1.5rem,3vw,2rem)] gap-y-6 max-[900px]:grid-cols-1">
            {columns.map((column, columnIndex) => (
              <div
                className="reveal flex flex-col gap-3"
                key={column.title ?? columnIndex}
              >
                {column.title ? (
                  <h3 className="mb-4 text-2xl text-ink">{column.title}</h3>
                ) : null}
                {column.items.map((item) => (
                  <details
                    className="group rounded-lg border border-l-[3px] border-line-soft border-l-navy-700 bg-paper shadow-soft transition-[border-color,box-shadow] duration-250 ease-brand open:border-l-gold-400 open:shadow-soft"
                    key={item.question}
                  >
                    <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-5 px-6 py-4 font-display text-lg font-semibold text-ink transition-colors duration-200 ease-brand marker:content-none hover:text-navy-600 focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 max-[640px]:gap-4 max-[640px]:px-4 max-[640px]:py-4">
                      <span
                        aria-hidden="true"
                        className="grid h-7 w-7 shrink-0 place-items-center text-navy-700 transition-[transform,color] duration-300 ease-brand group-open:rotate-45 group-open:text-gold-500"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          className="h-[18px] w-[18px]"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                      <span>{item.question}</span>
                    </summary>
                    <Answer
                      text={item.answer}
                      className="animate-[faq-in_300ms_var(--ease)_both] py-0 pr-6 pb-5 pl-[calc(1.5rem+28px+1.25rem)] text-base leading-relaxed text-ink-soft motion-reduce:animate-none max-[640px]:px-4"
                    />
                  </details>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

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
    return (
      <h2 className="mb-[0.5em] text-[clamp(2.1rem,3.8vw,3rem)] text-ink">
        {text}
      </h2>
    );
  return (
    <h2 className="mb-[0.5em] text-[clamp(2.1rem,3.8vw,3rem)] text-ink">
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
 * Style bằng Tailwind (component mẫu chuyển từ CSS thường — xem ghi chú trong
 * site.css, khối "FAQ" đã xoá). `open:` / `group-open:` bám theo `<details open>`
 * gốc trình duyệt, không cần state. `--ease`, `--shadow-soft`, `--radius-lg`…
 * lấy qua token đã khai trong tailwind.css (@theme inline) hoặc var() trực tiếp.
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
      <section className="section bg-cream-2" id={id}>
        <div className="container grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-stretch gap-[clamp(2.25rem,5vw,4.5rem)] max-[900px]:grid-cols-1">
          <div
            className={cn(
              "reveal flex flex-col py-[clamp(0.5rem,2vw,1.75rem)]",
              flipped && "order-2",
            )}
          >
            {section?.subheading ? (
              <p className="m-0 font-display text-[0.76rem] font-semibold tracking-[0.24em] text-gold-500 uppercase">
                {section.subheading}
              </p>
            ) : null}
            {section?.heading ? (
              <h2 className="mt-[0.7rem] mb-0 text-[clamp(2rem,3.3vw,2.85rem)] leading-[1.14] text-navy-900">
                {section.heading}
              </h2>
            ) : null}
            <RichIntro
              html={section?.content}
              className="mt-[1.1rem] max-w-[54ch] leading-[1.72] text-ink-soft [&_p]:mb-[0.65em] [&_p:last-child]:mb-0"
            />

            {list.length > 0 ? (
              <div className="mt-[clamp(1.5rem,3vw,2.25rem)] flex flex-col gap-[0.85rem]">
                {list.map((item) => (
                  <details
                    className="group rounded-2xl bg-paper shadow-[0_1px_2px_rgba(15,23,41,.04),0_20px_34px_-30px_rgba(15,23,41,.45)] transition-[box-shadow,transform] duration-[240ms] ease-brand open:shadow-[0_1px_2px_rgba(15,23,41,.05),0_26px_44px_-30px_rgba(15,23,41,.55)] hover:-translate-y-px"
                    key={item.question}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-[1.25rem] px-[1.45rem] py-[1.15rem] font-display text-base font-bold text-navy-900 transition-colors duration-200 ease-brand marker:content-none hover:text-navy-600 focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold-500 max-[640px]:gap-[0.9rem] max-[640px]:px-[1.15rem] max-[640px]:py-4">
                      <span>{item.question}</span>
                      <span
                        aria-hidden="true"
                        className="relative h-[18px] w-[18px] shrink-0 text-navy-700 transition-colors duration-[220ms] ease-brand group-open:text-gold-500 before:absolute before:top-1/2 before:left-0 before:h-[2px] before:w-full before:-translate-y-1/2 before:rounded-[2px] before:bg-current before:transition-[transform,opacity] before:duration-[250ms] before:ease-brand before:content-[''] after:absolute after:top-0 after:left-1/2 after:h-full after:w-[2px] after:-translate-x-1/2 after:rounded-[2px] after:bg-current after:transition-[transform,opacity] after:duration-[200ms] after:ease-brand after:content-[''] group-open:after:scale-y-0 group-open:after:opacity-0"
                      />
                    </summary>
                    <Answer
                      text={item.answer}
                      className="animate-[faq-in_300ms_var(--ease)_both] px-[1.45rem] pb-[1.3rem] text-[0.99rem] leading-[1.68] text-ink-soft motion-reduce:animate-none max-[640px]:px-[1.15rem] max-[640px]:pb-[1.15rem]"
                    />
                  </details>
                ))}
              </div>
            ) : null}

            {note ? (
              <p className="mt-auto border-t border-line pt-[1.1rem] text-[0.82rem] leading-[1.6] text-ink-faint max-[900px]:mt-[1.75rem]">
                {note}
              </p>
            ) : null}
          </div>

          {image ? (
            <figure className="reveal m-0 h-full min-h-[clamp(360px,44vw,620px)] overflow-hidden rounded-3xl bg-navy-800 shadow-soft max-[900px]:min-h-[320px] max-[640px]:min-h-[260px] max-[640px]:rounded-[18px]">
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
    <section className="section section-tint" id={id}>
      <div className="container">
        {section?.heading || section?.subheading || section?.content ? (
          <div className="reveal mx-auto mb-[clamp(2.5rem,5vw,3.5rem)] max-w-[52rem] text-center">
            {section?.subheading ? (
              <p className="mb-[0.7rem] text-[0.9rem] font-semibold tracking-[0.18em] text-gold-500 uppercase">
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
          <div className="grid grid-cols-2 items-start gap-x-[clamp(1.5rem,3vw,2rem)] gap-y-[1.4rem] max-[900px]:grid-cols-1">
            {columns.map((column, columnIndex) => (
              <div
                className="reveal flex flex-col gap-[0.8rem]"
                key={column.title ?? columnIndex}
              >
                {column.title ? (
                  <h3 className="mb-[1.1rem] text-2xl text-ink">
                    {column.title}
                  </h3>
                ) : null}
                {column.items.map((item) => (
                  <details
                    className="group rounded-lg border border-l-[3px] border-line-soft border-l-navy-700 bg-paper shadow-[0_6px_18px_-14px_rgba(15,23,41,.35)] transition-[border-color,box-shadow] duration-250 ease-brand open:border-l-gold-400 open:shadow-soft"
                    key={item.question}
                  >
                    <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-[1.2rem] px-[1.4rem] py-[1.05rem] font-display text-[1.08rem] font-semibold text-ink transition-colors duration-200 ease-brand marker:content-none hover:text-navy-600 focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 max-[640px]:gap-[0.9rem] max-[640px]:px-[1.1rem] max-[640px]:py-4">
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
                      className="animate-[faq-in_300ms_var(--ease)_both] py-0 pr-[1.4rem] pb-[1.25rem] pl-[calc(1.4rem+28px+1.2rem)] text-base leading-[1.65] text-ink-soft motion-reduce:animate-none max-[640px]:px-[1.1rem]"
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

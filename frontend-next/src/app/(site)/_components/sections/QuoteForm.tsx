import { QuoteForm as QuoteFormWidget } from "@/app/(site)/_components/forms";
import {
  InlineNote,
  RichIntro,
  anchorId,
  str,
  strings,
  type SectionProps,
} from "./shared";

/**
 * SECTION `quote-form` — nền navy: tiêu đề + checklist "Please include" bên trái,
 * form báo giá B2B (gửi API thật) bên phải.
 * CMS: heading, subheading, content, metadata.items [] (checklist), note (dòng cuối).
 *
 * Style bằng Tailwind, viết lại gần hết class `quote*` cũ — trừ `quote-checklist`
 * trên <ul>, GIỮ LẠI thuần làm hook cho SiteEffects.tsx (bắt `.reveal
 * .quote-checklist` để so le hiệu ứng hiện dần từng dòng); giá trị CSS của nó
 * đã copy y hệt sang Tailwind (kèm `!` ở margin) nên không lệch giao diện.
 * KHÔNG đụng site-wide rule ẩn eyebrow (`.section-head .eyebrow,.hero-copy
 * .eyebrow,…` — "Sếp không thích subtitle") — thay bằng `hidden` ngay tại đây.
 * `<h2>` không tự đặt màu: nó kế thừa `text-light` từ `<section>` qua rule
 * `h1,h2,h3,h4{color:inherit}` (site.css) — đúng hành vi bản gốc.
 * `--product-card-position` (biến nền ảnh cũ) chưa từng được set ở đâu, luôn
 * rơi về `center` — dùng thẳng `center`.
 */
export function QuoteForm({ section }: SectionProps) {
  const checklist = strings(section, "items");

  return (
    <section
      className="section relative overflow-hidden bg-[radial-gradient(120%_90%_at_90%_100%,rgba(37,55,94,.5)_0%,rgba(20,31,56,0)_55%),linear-gradient(160deg,var(--navy-900)_0%,var(--navy-800)_100%)] text-light before:pointer-events-none before:absolute before:inset-0 before:bg-[url('/images/almonds-table.webp')] before:bg-cover before:bg-center before:opacity-[0.14] before:content-['']"
      id={anchorId(section, "quote-form")}
    >
      <div className="relative container grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-[clamp(2.5rem,6vw,5rem)]">
        <div className="reveal">
          {/* Site ẩn eyebrow trên mọi khối (site.css) — giữ render để đổi ý thì chỉ cần bỏ `hidden`. */}
          {section?.subheading ? (
            <p className="eyebrow eyebrow-gold hidden">{section.subheading}</p>
          ) : null}
          {section?.heading ? (
            <h2 className="text-[clamp(2.1rem,3.8vw,3rem)]">
              {section.heading}
            </h2>
          ) : null}
          <RichIntro
            html={section?.content}
            className="max-w-176 text-[1.16rem] text-light-soft [&_p]:mb-[1em]! [&_p:last-child]:mb-0!"
          />
          {checklist.length > 0 ? (
            <ul className="quote-checklist my-[1.8rem]! grid grid-cols-2 gap-x-[1.4rem] gap-y-[0.65rem]">
              {checklist.map((item) => (
                <li
                  className="flex items-center gap-[0.65rem] text-[1.05rem] text-light before:text-[0.7em] before:text-gold-300 before:content-['✦']"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          <InlineNote
            text={str(section, "note")}
            className="border-t border-[rgba(245,241,227,0.18)] pt-[1.2rem] text-[1.02rem] text-light-soft italic"
          />
        </div>

        <QuoteFormWidget />
      </div>
    </section>
  );
}

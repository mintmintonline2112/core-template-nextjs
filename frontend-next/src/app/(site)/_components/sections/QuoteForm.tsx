import { QuoteForm as QuoteFormWidget } from "@/app/(site)/_components/forms";
import { Eyebrow, SECTION } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  InlineNote,
  RichIntro,
  anchorId,
  showsEyebrow,
  str,
  strings,
  type SectionProps,
} from "./shared";

/**
 * SECTION `quote-form` — nền navy: tiêu đề + checklist "Please include" bên trái,
 * form báo giá B2B (gửi API thật) bên phải.
 * CMS: heading, subheading, content, metadata.items [] (checklist), note (dòng cuối).
 *
 * Checklist hiện dần so le từng dòng: <ul> là `reveal-group` nằm trong khối
 * `.reveal`. `<h2>` không tự đặt màu — kế thừa `text-light` từ <section>.
 */
export function QuoteForm({ section }: SectionProps) {
  const checklist = strings(section, "items");

  return (
    <section
      className={cn(
        SECTION,
        "relative overflow-hidden bg-[radial-gradient(120%_90%_at_90%_100%,color-mix(in_oklab,var(--navy-600)_50%,transparent)_0%,transparent_55%),linear-gradient(160deg,var(--navy-900)_0%,var(--navy-800)_100%)] text-light before:pointer-events-none before:absolute before:inset-0 before:bg-[url('/images/placeholder-wide.svg')] before:bg-cover before:bg-center before:opacity-[0.14] before:content-['']",
      )}
      id={anchorId(section, "quote-form")}
    >
      <div className="relative site-container grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-[clamp(2.5rem,6vw,5rem)] max-[900px]:grid-cols-1">
        <div className="reveal">
          {section?.subheading ? (
            <Eyebrow gold heading show={showsEyebrow(section)}>
              {section.subheading}
            </Eyebrow>
          ) : null}
          {section?.heading ? (
            <h2 className="text-h2">{section.heading}</h2>
          ) : null}
          <RichIntro
            html={section?.content}
            className="max-w-176 text-lg text-light-soft [&_p]:mb-[1em] [&_p:last-child]:mb-0"
          />
          {checklist.length > 0 ? (
            <ul
              data-stagger="45"
              className="reveal-group my-7 grid grid-cols-2 gap-x-6 gap-y-3 max-[640px]:grid-cols-1"
            >
              {checklist.map((item) => (
                <li
                  className="flex items-center gap-3 text-base text-light before:text-[0.7em] before:text-gold-300 before:content-['✦']"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          <InlineNote
            text={str(section, "note")}
            className="border-t border-light/20 pt-5 text-base text-light-soft italic"
          />
        </div>

        <QuoteFormWidget />
      </div>
    </section>
  );
}

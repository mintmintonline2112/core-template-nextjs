import { SizeRuler } from "@/app/(site)/_components/SizeRuler";
import {
  SECTION,
  SECTION_FLOW,
  SECTION_TINT,
} from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Head,
  anchorId,
  layoutOf,
  str,
  strings,
  type SectionProps,
} from "./shared";

const LAYOUTS = ["section", "band"] as const;

/** Tiêu đề nhỏ kiểu panel: gạch vàng ngắn + chữ in hoa giãn ký tự. */
function PanelTitle({ text, center }: { text: string; center?: boolean }) {
  return (
    <h3
      className={cn(
        "mb-7 flex items-center gap-4 text-base font-semibold tracking-xl text-navy-700 uppercase",
        center && "justify-center",
      )}
    >
      <span className="h-px w-[2.4rem] bg-gold-400" />
      {text}
    </h3>
  );
}

/** Chú thích dưới thước — giữ margin-bottom 1em mặc định của thẻ <p>. */
function Footnote({ text }: { text: string }) {
  return <p className="mt-6 text-base text-ink-faint italic">{text}</p>;
}

/**
 * SECTION `size-scale` — thước đo cỡ hạt (panel navy, hạt vàng nhỏ dần).
 * layout `section`: đầu khối lớn (eyebrow + heading + intro) rồi tới thước.
 * layout `band`:    dải gọn — tiêu đề nhỏ có gạch vàng (heading) + thước; ghép
 *                   liền dưới khối khác được (section-flow).
 * CMS: heading, subheading, content, metadata.items [] (kernels/oz),
 * scaleNote (chữ vàng trong thước), footnote (chú thích dưới thước).
 * Thước nằm ở SizeRuler.tsx.
 */
export function SizeScale({ section }: SectionProps) {
  const id = anchorId(section, "size-scale");
  const sizes = strings(section, "items");
  const scaleNote = str(section, "scaleNote");
  const footnote = str(section, "footnote");

  if (layoutOf(section, LAYOUTS, "section") === "band") {
    return (
      <section className={cn(SECTION, SECTION_TINT, SECTION_FLOW)} id={id}>
        <div className="site-container">
          <div className="reveal mx-auto mt-[clamp(2.5rem,5vw,3.5rem)] max-w-[58rem]">
            {section?.heading ? (
              <PanelTitle text={section.heading} center />
            ) : null}
            {sizes.length > 0 ? (
              <SizeRuler sizes={sizes} note={scaleNote} />
            ) : null}
            {footnote ? <Footnote text={footnote} /> : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={SECTION} id={id}>
      <div className="site-container">
        <Head section={section} />
        <div className="reveal">
          {sizes.length > 0 ? (
            <SizeRuler sizes={sizes} note={scaleNote} />
          ) : null}
          {footnote ? <Footnote text={footnote} /> : null}
        </div>
      </div>
    </section>
  );
}

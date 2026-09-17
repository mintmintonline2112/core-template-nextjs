import type { CSSProperties } from "react";
import {
  HeroSlides,
  type HeroSlide,
} from "@/app/(site)/_components/HeroSlides";
import {
  Eyebrow,
  HERO_TEXT,
  NAVY_GRAIN,
  NAVY_PATTERN,
} from "@/app/(site)/_components/ui";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { cn } from "@/utils/cn";
import {
  Cta,
  StatsList,
  anchorId,
  items,
  layoutOf,
  resolveImage,
  showsEyebrow,
  str,
  toHtml,
  type SectionProps,
} from "./shared";

const LAYOUTS = ["slider", "static"] as const;

/** Hàng nút CTA — dùng cho cả hai bố cục. */
const ACTIONS_ROW = "mt-9 flex flex-wrap gap-4";

const ALMOND_GLYPH = (
  <>
    <path d="M16 3 C 22 9 26 16 24 22 C 22.5 27 9.5 27 8 22 C 6 16 10 9 16 3 Z" />
    <path d="M16 8 C 19 12 20.6 15.8 19.7 19.5" strokeWidth="1" />
  </>
);

/**
 * Hạt hạnh nhân mờ trôi lơ lửng trong hero. Chu kỳ và độ trễ truyền qua biến
 * `--float-dur` / `--float-delay` để mỗi hạt lệch nhịp nhau (keyframes `floaty`
 * ở effects.css).
 */
function FloatGlyph({
  style,
  dur,
  delay,
  width,
}: {
  style: CSSProperties;
  dur: string;
  delay?: string;
  width: number;
}) {
  return (
    <svg
      style={
        {
          ...style,
          width,
          ["--float-dur" as string]: dur,
          ["--float-delay" as string]: delay,
        } as CSSProperties
      }
      className="absolute animate-[floaty_var(--float-dur,16s)_ease-in-out_var(--float-delay,0s)_infinite_alternate] text-gold-300 opacity-10 will-change-transform"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      {ALMOND_GLYPH}
    </svg>
  );
}

/**
 * SECTION `hero` — khối đầu trang.
 * layout `slider`: ảnh nền chuyển slide, tiêu đề + mô tả bên trái đổi theo slide,
 *   dãy số slide bên phải; nút CTA và số liệu cố định.
 * layout `static`: tiêu đề lớn + giới thiệu + 2 nút + số liệu, ảnh tràn mép phải.
 * CMS: subheading (eyebrow), heading, content, metadata.slides [{image,title,text,alt}],
 * stats [{label,value}], image (ảnh layout static), ctaLabel/ctaHref, cta2Label/cta2Href.
 *
 * Bố cục static: h1 mang `data-headline` để SiteEffects.tsx tách chữ chạy hiệu
 * ứng GSAP; cột chữ mang `data-stagger` để các dòng hiện dần so le.
 */
export function Hero({ section }: SectionProps) {
  const id = anchorId(section, "hero");
  const stats = items(section, "stats");
  const actions = (
    <>
      <Cta
        label={str(section, "ctaLabel")}
        href={str(section, "ctaHref")}
        className="btn btn-gold"
      />
      <Cta
        label={str(section, "cta2Label")}
        href={str(section, "cta2Href")}
        className="btn btn-ghost"
      />
    </>
  );
  const hasActions = Boolean(
    str(section, "ctaLabel") || str(section, "cta2Label"),
  );

  const slides: HeroSlide[] = items(section, "slides")
    .filter((slide) => slide.image)
    .map((slide) => {
      const title = slide.title || section?.heading || "";
      const text = slide.text || section?.content || "";
      return {
        src: resolveImage(slide.image),
        alt: slide.alt || title,
        title,
        html: text ? sanitizeRichText(toHtml(text)) : "",
      };
    });

  // Không có slide thì rơi về bố cục tĩnh (không để hero trống).
  if (layoutOf(section, LAYOUTS, "slider") === "slider" && slides.length > 0) {
    return (
      <HeroSlides
        id={id}
        eyebrow={section?.subheading}
        showEyebrow={showsEyebrow(section)}
        slides={slides}
      >
        {hasActions ? <div className={ACTIONS_ROW}>{actions}</div> : null}
        <StatsList stats={stats} className="reveal" />
      </HeroSlides>
    );
  }

  const image = str(section, "image");
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[radial-gradient(120%_90%_at_85%_10%,color-mix(in_oklab,var(--navy-600)_55%,transparent)_0%,transparent_55%),linear-gradient(160deg,var(--navy-800)_0%,var(--navy-900)_78%)] text-light",
        NAVY_PATTERN,
        NAVY_GRAIN,
      )}
      id={id}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
        aria-hidden="true"
      >
        <FloatGlyph style={{ top: "14%", left: "5%" }} width={40} dur="15s" />
        <FloatGlyph
          style={{ top: "64%", left: "11%" }}
          width={26}
          dur="19s"
          delay="-6s"
        />
        <FloatGlyph
          style={{ top: "8%", right: "14%" }}
          width={30}
          dur="17s"
          delay="-3s"
        />
        <FloatGlyph
          style={{ top: "78%", right: "6%" }}
          width={44}
          dur="21s"
          delay="-10s"
        />
        <FloatGlyph
          style={{ top: "40%", left: "44%" }}
          width={20}
          dur="14s"
          delay="-8s"
        />
      </div>
      <div className="relative z-1 site-container grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-[clamp(2.5rem,6vw,5rem)] py-[clamp(4.5rem,9vw,7.5rem)] max-[900px]:grid-cols-1">
        <div data-stagger="90">
          {section?.subheading ? (
            <Eyebrow
              gold
              heading
              show={showsEyebrow(section)}
              className="reveal"
            >
              {section.subheading}
            </Eyebrow>
          ) : null}
          {section?.heading ? (
            <h1
              data-headline
              className="reveal mb-[0.5em] text-display font-semibold text-light"
            >
              {section.heading}
            </h1>
          ) : null}
          {section?.content ? (
            <div
              className={cn(HERO_TEXT, "reveal")}
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(section.content),
              }}
            />
          ) : null}
          {hasActions ? (
            <div className={`${ACTIONS_ROW} reveal`}>{actions}</div>
          ) : null}
          <StatsList stats={stats} className="reveal" />
        </div>
      </div>

      {image ? (
        // Ảnh hero tràn mép phải — không khung, không viền, cạnh trái hòa vào nền
        // nhờ mask chuyển dần. Dưới 900px ảnh trở lại dòng thường, mask đổi hướng.
        <figure
          className="reveal absolute inset-y-0 right-0 z-0 m-0 w-[min(55vw,1150px)] max-[900px]:relative max-[900px]:inset-auto max-[900px]:h-[300px] max-[900px]:w-full"
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImage(image)}
            alt=""
            className="h-full w-full [mask-image:linear-gradient(to_right,transparent_0,#000_34%)] object-cover [-webkit-mask-image:linear-gradient(to_right,transparent_0,#000_34%)] max-[900px]:[mask-image:linear-gradient(to_bottom,transparent_0,#000_22%)] max-[900px]:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0,#000_22%)]"
          />
        </figure>
      ) : null}
    </section>
  );
}

import type { CSSProperties } from "react";
import { HeroSlides, type HeroSlide } from "@/app/(site)/_components/HeroSlides";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import {
  Cta,
  StatsList,
  anchorId,
  items,
  layoutOf,
  resolveImage,
  str,
  toHtml,
  type SectionProps,
} from "./shared";

const LAYOUTS = ["slider", "static"] as const;

const ALMOND_GLYPH = (
  <>
    <path d="M16 3 C 22 9 26 16 24 22 C 22.5 27 9.5 27 8 22 C 6 16 10 9 16 3 Z" />
    <path d="M16 8 C 19 12 20.6 15.8 19.7 19.5" strokeWidth="1" />
  </>
);

function FloatGlyph({ style, dur, delay, width }: { style: CSSProperties; dur: string; delay?: string; width: number }) {
  return (
    <svg
      style={{ ...style, width, ["--float-dur" as string]: dur, ["--float-delay" as string]: delay } as CSSProperties}
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
 */
export function Hero({ section }: SectionProps) {
  const id = anchorId(section, "hero");
  const stats = items(section, "stats");
  const actions = (
    <>
      <Cta label={str(section, "ctaLabel")} href={str(section, "ctaHref")} className="btn btn-gold" />
      <Cta label={str(section, "cta2Label")} href={str(section, "cta2Href")} className="btn btn-ghost" />
    </>
  );
  const hasActions = Boolean(str(section, "ctaLabel") || str(section, "cta2Label"));

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
      <HeroSlides id={id} eyebrow={section?.subheading} slides={slides}>
        {hasActions ? <div className="hero-actions">{actions}</div> : null}
        <StatsList stats={stats} className="hero-stats reveal" />
      </HeroSlides>
    );
  }

  const image = str(section, "image");
  return (
    <section className="hero" id={id}>
      <div className="hero-float" aria-hidden="true">
        <FloatGlyph style={{ top: "14%", left: "5%" }} width={40} dur="15s" />
        <FloatGlyph style={{ top: "64%", left: "11%" }} width={26} dur="19s" delay="-6s" />
        <FloatGlyph style={{ top: "8%", right: "14%" }} width={30} dur="17s" delay="-3s" />
        <FloatGlyph style={{ top: "78%", right: "6%" }} width={44} dur="21s" delay="-10s" />
        <FloatGlyph style={{ top: "40%", left: "44%" }} width={20} dur="14s" delay="-8s" />
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          {section?.subheading ? <p className="eyebrow eyebrow-gold reveal">{section.subheading}</p> : null}
          {section?.heading ? <h1 className="reveal">{section.heading}</h1> : null}
          {section?.content ? (
            <div className="hero-cms reveal" dangerouslySetInnerHTML={{ __html: sanitizeRichText(section.content) }} />
          ) : null}
          {hasActions ? <div className="hero-actions reveal">{actions}</div> : null}
          <StatsList stats={stats} className="hero-stats reveal" />
        </div>
      </div>

      {image ? (
        // Ảnh hero tràn mép phải — không khung, không viền, cạnh trái hòa vào nền
        <figure className="hero-figure-bleed reveal" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolveImage(image)} alt="" />
        </figure>
      ) : null}
    </section>
  );
}

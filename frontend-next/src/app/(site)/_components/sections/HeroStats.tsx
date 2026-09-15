import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { metaOf, type StandardSectionProps } from "./section-content";

const ALMOND_GLYPH = (
  <>
    <path d="M16 3 C 22 9 26 16 24 22 C 22.5 27 9.5 27 8 22 C 6 16 10 9 16 3 Z" />
    <path d="M16 8 C 19 12 20.6 15.8 19.7 19.5" strokeWidth="1" />
  </>
);

function FloatGlyph({ style, dur, delay, width }: { style: React.CSSProperties; dur: string; delay?: string; width: number }) {
  return (
    <svg
      style={{ ...style, width, ["--float-dur" as string]: dur, ["--float-delay" as string]: delay } as React.CSSProperties}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      {ALMOND_GLYPH}
    </svg>
  );
}

/** Giá trị thống kê: chữ số hiển thị lớn, ký tự ′ / + thu nhỏ (stat-suffix). */
function StatValue({ value }: { value: string }) {
  const count = /^\d/.test(value) ? Number.parseInt(value, 10) : undefined;
  const parts = value.split(/([′+])/).filter(Boolean);
  return (
    <dd data-count={count}>
      {parts.map((part, index) =>
        part === "′" || part === "+" ? (
          <span className="stat-suffix" key={index}>{part}</span>
        ) : (
          part
        ),
      )}
    </dd>
  );
}

const DEFAULT_INTRO =
  "<p>Reliable California almond sourcing, procurement, and export coordination for wholesale buyers worldwide.</p>" +
  "<p>Prime Nuts USA connects international buyers with established growers, handlers, processors, and logistics partners throughout California. Tell us your required variety, grade, size, volume, packaging, and destination&mdash;we will identify suitable supply options and coordinate the purchasing process through shipment.</p>";

const DEFAULT_STATS = [
  { label: "California Varieties", value: "4+" },
  { label: "Kernel Sizes", value: "6" },
  { label: "Steps to Shipment", value: "5" },
];

/**
 * SECTION `hero-stats` — trang Home.
 * Tiêu đề lớn, đoạn giới thiệu (đoạn đầu là lead), 2 nút CTA và dải số liệu đếm.
 * CMS: heading, subheading (eyebrow), content, metadata.stats [{label,value}].
 */
export function HeroStats({ section }: StandardSectionProps) {
  const stats = (metaOf<Array<{ label?: string; value?: string }>>(section, "stats") ?? DEFAULT_STATS)
    .filter((stat) => stat.label && stat.value);

  return (
    <section className="hero" id={section?.sectionKey ?? "hero-stats"}>
      <div className="hero-float" aria-hidden="true">
        <FloatGlyph style={{ top: "14%", left: "5%" }} width={40} dur="15s" />
        <FloatGlyph style={{ top: "64%", left: "11%" }} width={26} dur="19s" delay="-6s" />
        <FloatGlyph style={{ top: "8%", right: "14%" }} width={30} dur="17s" delay="-3s" />
        <FloatGlyph style={{ top: "78%", right: "6%" }} width={44} dur="21s" delay="-10s" />
        <FloatGlyph style={{ top: "40%", left: "44%" }} width={20} dur="14s" delay="-8s" />
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow eyebrow-gold reveal">
            {section?.subheading ?? "California Almond Sourcing"}
          </p>
          <h1 className="reveal">
            {section?.heading ?? "California Almonds. Sourced with Confidence."}
          </h1>
          <div
            className="hero-cms reveal"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(section?.content ?? DEFAULT_INTRO) }}
          />
          <div className="hero-actions reveal">
            <a href="#request-quote" className="btn btn-gold">Request a Quote</a>
            <a href="#product-specs" className="btn btn-ghost">Send Your Specifications</a>
          </div>

          <dl className="hero-stats reveal">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <dt>{stat.label}</dt>
                <StatValue value={stat.value!} />
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Ảnh hero tràn mép phải — không khung, không viền, cạnh trái hòa vào nền */}
      <figure className="hero-figure-bleed reveal" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/orchard-rows.jpg" alt="" />
      </figure>
    </section>
  );
}

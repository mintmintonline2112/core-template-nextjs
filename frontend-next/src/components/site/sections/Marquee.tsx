import { GenericBlock } from "./GenericBlock";
import { meta, strings, type SectionProps } from "./shared";

/** Chữ chạy ngang (marquee) — metadata.audiences []; trống thì rơi về khối generic. */
export function Marquee({ section, index }: SectionProps) {
  const audiences = strings(meta(section), "audiences");
  if (audiences.length === 0) return <GenericBlock section={section} index={index} />;

  const line = (
    <p className="serve-copy" aria-hidden="true">
      {audiences.map((item) => (
        <span key={item} style={{ display: "contents" }}>
          <span>{item}</span>
          <span className="serve-dot">✦</span>
        </span>
      ))}
    </p>
  );

  return (
    <section className="serve-band" id={section.sectionKey}>
      <div className="container reveal">
        {section.heading ? <p className="eyebrow">{section.heading}</p> : null}
        <p className="sr-only">{audiences.join(", ")}</p>
        <div className="serve-marquee">
          <div className="serve-track">
            {line}
            {line}
          </div>
        </div>
      </div>
    </section>
  );
}

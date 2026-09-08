import { SourcingSlider, type SourcingSlide } from "@/app/(site)/_components/SourcingSlider";
import { Head, Shell, items, meta, resolveImage, strings, type SectionProps } from "./shared";

/** Slider ảnh + chuỗi bước (nền xanh đậm) — metadata.slides [{image,caption}], metadata.chain []. */
export function SliderChain({ section }: SectionProps) {
  const m = meta(section);
  const slides: SourcingSlide[] = items(m, "slides")
    .filter((slide) => slide.image)
    .map((slide) => ({ src: resolveImage(slide.image), caption: slide.caption, alt: slide.alt }));
  const chain = strings(m, "chain");
  return (
    <Shell dark id={section.sectionKey}>
      <Head section={section} light />
      {slides.length > 0 ? <SourcingSlider slides={slides} /> : null}
      {chain.length > 0 ? (
        <ol className="chain reveal">
          {chain.map((title, i) => (
            <li
              className={`chain-step${/prime nuts/i.test(title) ? " chain-step-highlight" : ""}`}
              key={title}
            >
              <span className="chain-num">{i + 1}</span>
              <h3>{title}</h3>
              <p></p>
            </li>
          ))}
        </ol>
      ) : null}
    </Shell>
  );
}

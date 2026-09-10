import { SourcingBlock } from "@/app/(site)/_components/SourcingBlock";
import { type SourcingSlide } from "@/app/(site)/_components/SourcingSlider";
import { Head, Shell, items, meta, resolveImage, strings, type SectionProps } from "./shared";

/** Slider ảnh + chuỗi bước bấm được (nền xanh đậm) — metadata.slides [{image,caption}], metadata.chain []. */
export function SliderChain({ section }: SectionProps) {
  const m = meta(section);
  const slides: SourcingSlide[] = items(m, "slides")
    .filter((slide) => slide.image)
    .map((slide) => ({ src: resolveImage(slide.image), caption: slide.caption, alt: slide.alt }));
  const chain = strings(m, "chain").map((title) => ({ title }));
  return (
    <Shell dark id={section.sectionKey}>
      <Head section={section} light />
      {slides.length > 0 || chain.length > 0 ? (
        <SourcingBlock slides={slides} chain={chain} />
      ) : null}
    </Shell>
  );
}

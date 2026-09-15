import { SourcingBlock } from "@/app/(site)/_components/SourcingBlock";
import { type SourcingSlide } from "@/app/(site)/_components/SourcingSlider";
import { resolveImage } from "./shared";
import { RichIntro, metaOf, type StandardSectionProps } from "./section-content";

/** 5 bước mặc định — dùng chung với WorkingProcess khi CMS trống. */
export const HOW_IT_WORKS_STEPS = [
  { title: "Send Your Requirements", text: "Provide the variety, size, grade, quantity, packaging, destination port, preferred shipment date, and Incoterm." },
  { title: "We Source in California", text: "Our team reviews available supply and identifies options that match your product and commercial requirements." },
  { title: "Review the Offer", text: "You receive the applicable product specifications, pricing, packing details, commercial terms, and estimated availability." },
  { title: "Confirm the Order", text: "Once the terms are agreed upon, we coordinate the order, documentation, and required arrangements with the appropriate suppliers and logistics partners." },
  { title: "Coordinate Shipment", text: "Prime Nuts USA follows the order through export preparation, container coordination, and cargo dispatch." },
];

/**
 * SECTION `how-it-works` — trang Home (nền navy).
 * Slider ảnh tự chạy + chuỗi ô bước bấm được (bước N ↔ ảnh N) + nút CTA.
 * CMS: heading, subheading, content, metadata.slides [{image,caption,alt}], metadata.chain [].
 */
export function HowItWorks({ section }: StandardSectionProps) {
  // Ảnh /images/... là ảnh tĩnh của frontend; còn lại (uploads/...) trỏ về backend.
  const slides: SourcingSlide[] | undefined = metaOf<Array<{ image?: string; caption?: string; alt?: string }>>(
    section,
    "slides",
  )
    ?.filter((slide) => typeof slide.image === "string" && slide.image)
    .map((slide) => ({ src: resolveImage(slide.image!), caption: slide.caption, alt: slide.alt }));

  // Tên bước từ CMS; trùng bước mặc định thì giữ mô tả mặc định.
  const cmsChain = metaOf<string[]>(section, "chain")?.filter(Boolean);
  const steps =
    cmsChain && cmsChain.length > 0
      ? cmsChain.map((title, index) => ({
          title,
          text: title === HOW_IT_WORKS_STEPS[index]?.title ? HOW_IT_WORKS_STEPS[index].text : "",
        }))
      : HOW_IT_WORKS_STEPS;

  return (
    <section className="section section-dark" id={section?.sectionKey ?? "how-it-works"}>
      <div className="container">
        <div className="section-head section-head-light reveal">
          <p className="eyebrow eyebrow-gold">{section?.subheading ?? "How It Works"}</p>
          <h2>{section?.heading ?? "How It Works"}</h2>
          <RichIntro html={section?.content} />
        </div>

        <SourcingBlock slides={slides} chain={steps} />

        <p className="section-note section-note-light reveal">
          <a href="#request-quote" className="btn btn-gold btn-sm">Start a Sourcing Request</a>
        </p>
      </div>
    </section>
  );
}

import { SizeScale } from "@/app/(site)/_components/SizeScale";
import { KERNEL_SIZES } from "@/config/products";
import { RichIntro, metaOf, type StandardSectionProps } from "./section-content";

const DEFAULT_INTRO =
  "<p>Natural almond kernels are graded by count per ounce. The most commonly traded California sizes:</p>";

/**
 * SECTION `kernel-sizes` — trang Products.
 * Thước đo cỡ hạt (hạt vàng nhỏ dần) + ghi chú.
 * CMS: heading, subheading, content, metadata.sizes [] (kernels/oz).
 */
export function KernelSizes({ section }: StandardSectionProps) {
  const cmsSizes = (metaOf<string[]>(section, "sizes") ?? []).filter(Boolean);
  const sizes = cmsSizes.length > 0 ? cmsSizes : [...KERNEL_SIZES];

  return (
    <section className="section" id={section?.sectionKey ?? "kernel-sizes"}>
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow">{section?.subheading ?? "Specifications"}</p>
          <h2>{section?.heading ?? "Common Kernel Sizes"}</h2>
          <RichIntro html={section?.content ?? DEFAULT_INTRO} />
        </div>

        <div className="product-sizes reveal">
          <SizeScale sizes={sizes} />
          <p className="panel-footnote">
            Different grades, varieties and specifications may be available depending on crop
            and market conditions.
          </p>
        </div>
      </div>
    </section>
  );
}

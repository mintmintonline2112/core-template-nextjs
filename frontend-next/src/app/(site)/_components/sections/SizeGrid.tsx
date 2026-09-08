import { SizeScale } from "@/app/(site)/_components/SizeScale";
import { Head, Shell, meta, strings, type SectionProps } from "./shared";

/** Thước đo cỡ hạt — metadata.sizes [] (kernels/oz). */
export function SizeGrid({ section, index }: SectionProps) {
  const sizes = strings(meta(section), "sizes");
  return (
    <Shell tint={index % 2 === 1} id={section.sectionKey}>
      <Head section={section} />
      <div className="product-sizes reveal">
        <SizeScale sizes={sizes} />
      </div>
    </Shell>
  );
}

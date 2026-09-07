import { Head, Shell, meta, strings, type SectionProps } from "./shared";

/** Lưới cỡ hạt — metadata.sizes [] (kernels/oz). */
export function SizeGrid({ section, index }: SectionProps) {
  const sizes = strings(meta(section), "sizes");
  return (
    <Shell tint={index % 2 === 1} id={section.sectionKey}>
      <Head section={section} />
      <div className="product-sizes reveal">
        <div className="size-grid">
          {sizes.map((size) => (
            <div className="size-cell" key={size}>
              <span className="size-num">{size}</span>
              <span className="size-cap">kernels / oz</span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

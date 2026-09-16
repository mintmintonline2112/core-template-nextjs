import { SizeRuler } from "@/app/(site)/_components/SizeRuler";
import { Head, anchorId, layoutOf, str, strings, type SectionProps } from "./shared";

const LAYOUTS = ["section", "band"] as const;

/**
 * SECTION `size-scale` — thước đo cỡ hạt (panel navy, hạt vàng nhỏ dần).
 * layout `section`: đầu khối lớn (eyebrow + heading + intro) rồi tới thước.
 * layout `band`:    dải gọn — tiêu đề nhỏ có gạch vàng (heading) + thước; ghép
 *                   liền dưới khối khác được (section-flow).
 * CMS: heading, subheading, content, metadata.items [] (kernels/oz),
 * scaleNote (chữ vàng trong thước), footnote (chú thích dưới thước).
 */
export function SizeScale({ section }: SectionProps) {
  const id = anchorId(section, "size-scale");
  const sizes = strings(section, "items");
  const scaleNote = str(section, "scaleNote");
  const footnote = str(section, "footnote");

  if (layoutOf(section, LAYOUTS, "section") === "band") {
    return (
      <section className="section section-tint section-flow" id={id}>
        <div className="container">
          <div className="product-sizes product-sizes-band reveal">
            {section?.heading ? (
              <h3 className="panel-title"><span className="panel-title-line" />{section.heading}</h3>
            ) : null}
            {sizes.length > 0 ? <SizeRuler sizes={sizes} note={scaleNote} /> : null}
            {footnote ? <p className="panel-footnote">{footnote}</p> : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" id={id}>
      <div className="container">
        <Head section={section} />
        <div className="product-sizes reveal">
          {sizes.length > 0 ? <SizeRuler sizes={sizes} note={scaleNote} /> : null}
          {footnote ? <p className="panel-footnote">{footnote}</p> : null}
        </div>
      </div>
    </section>
  );
}

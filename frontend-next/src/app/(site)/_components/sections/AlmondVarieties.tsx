import { SizeScale } from "@/app/(site)/_components/SizeScale";
import { KERNEL_SIZES } from "@/config/products";
import { resolveImage } from "./shared";
import { RichIntro, metaOf, type StandardSectionProps } from "./section-content";

const DEFAULT_INTRO =
  "<p>California is the center of the global almond industry, supported by an extensive network of experienced growers, handlers, processors, and exporters.</p>" +
  "<p>Prime Nuts USA helps wholesale buyers source California almonds according to their specific commercial requirements, including variety, grade, size, crop year, packaging, order volume, destination, and preferred shipping schedule.</p>";

const VARIETIES = [
  { name: "Nonpareil", text: "Known for its light color, smooth surface, attractive appearance, and broad range of commercial applications." },
  { name: "Independence", text: "A widely available California variety suitable for wholesale, roasting, processing, and ingredient applications." },
  { name: "Carmel-Type Almonds", text: "Versatile almonds commonly selected for processing, roasting, and food manufacturing." },
  { name: "California-Type Almonds", text: "Commercial varieties available in multiple sizes and specifications, depending on the crop and current market availability." },
];

// Ảnh tròn cho dàn giống — lặp vòng khi CMS thêm giống mới.
const VARIETY_PHOTOS = [
  "/images/almonds-ramekin.webp",
  "/images/almonds-table.webp",
  "/images/kernels-study.jpg",
  "/images/green-almond.jpg",
];

const DEFAULT_PHOTOS = [
  { src: "/images/kernels-study.jpg", caption: "In-shell, natural & blanched kernels" },
  { src: "/images/almonds-ramekin.webp", caption: "Ready for snacking & retail" },
  { src: "/images/hero-branch.jpg", caption: "Fresh crop on the tree" },
];

/**
 * SECTION `almond-varieties` — trang Home.
 * Ảnh tròn đánh số từng giống, thước cỡ hạt, dải 3 ảnh và nút xem hàng.
 * CMS: heading, subheading, content, metadata.varieties [], sizes [], photos [{image,caption}].
 */
export function AlmondVarieties({ section }: StandardSectionProps) {
  const cmsVarieties = metaOf<string[]>(section, "varieties");
  const varieties =
    cmsVarieties && cmsVarieties.length > 0
      ? cmsVarieties.filter(Boolean).map((name) => ({
          name,
          text: VARIETIES.find((variety) => variety.name === name)?.text ?? "",
        }))
      : VARIETIES;
  const sizes = (metaOf<string[]>(section, "sizes") ?? [...KERNEL_SIZES]).filter(Boolean);
  const photos =
    metaOf<Array<{ image?: string; caption?: string }>>(section, "photos")
      ?.filter((photo) => typeof photo.image === "string" && photo.image)
      .map((photo) => ({ src: resolveImage(photo.image!), caption: photo.caption ?? "" })) ??
    DEFAULT_PHOTOS;

  return (
    <section className="section section-tint" id={section?.sectionKey ?? "almond-varieties"}>
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow">{section?.subheading ?? "California Almonds"}</p>
          <h2>{section?.heading ?? "Sourced from California. Supplied to Your Requirements."}</h2>
          <RichIntro html={section?.content ?? DEFAULT_INTRO} />
        </div>

        {/* Dàn ảnh tròn đánh số — mỗi giống một vòng tròn + badge số */}
        <ul className="variety-circles reveal">
          {varieties.map((variety, index) => (
            <li className="variety-circle" key={variety.name}>
              <div className="vc-photo">
                <span className="vc-num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={VARIETY_PHOTOS[index % VARIETY_PHOTOS.length]} alt={variety.name} loading="lazy" />
              </div>
              <h4>{variety.name}</h4>
              {variety.text ? <p>{variety.text}</p> : null}
            </li>
          ))}
        </ul>

        <div className="product-sizes product-sizes-band reveal">
          <h3 className="panel-title"><span className="panel-title-line" />Available Sizes</h3>
          <SizeScale sizes={sizes} />
          <p className="panel-footnote">
            USDA grades and commercial specifications available upon request.
          </p>
        </div>

        <div className="photo-strip reveal">
          {photos.map((photo) => (
            <figure key={photo.src}>
              <div className="photo-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={photo.caption} loading="lazy" />
              </div>
              {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
            </figure>
          ))}
        </div>

        <p className="section-note reveal">
          Additional varieties and custom specifications may be sourced upon request.
          <br />
          <a href="#request-quote" className="btn btn-ghost-dark btn-sm" style={{ marginTop: "1rem" }}>
            Check Current Availability
          </a>
        </p>
      </div>
    </section>
  );
}

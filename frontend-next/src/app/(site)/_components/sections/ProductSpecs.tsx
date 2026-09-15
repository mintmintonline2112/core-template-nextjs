import { KERNEL_SIZES } from "@/config/products";
import { IconBadge } from "./shared";
import { RichIntro, metaOf, type StandardSectionProps } from "./section-content";

const DEFAULT_INTRO =
  "<p>Every buyer and destination market has different requirements. We source almonds according to the specifications provided with each inquiry.</p>" +
  "<p>Other sizes, private specifications, and custom packing requirements may be discussed for qualified volume orders.</p>";

// Dòng thông số mặc định — icon giữ theo thứ tự dòng.
const SPECS = [
  { title: "Product", text: "Natural California Almond Kernels", icon: <><path d="M12 3c3.5 3.6 5.6 7.6 4.5 11-1 3-8 3-9 0C6.4 10.6 8.5 6.6 12 3z" /><path d="M12 7c1.6 2.2 2.4 4.4 2 6.4" /></> },
  { title: "Origin", text: "California, USA", icon: <><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></> },
  { title: "Varieties", text: "Nonpareil, Independence, Carmel-Type, California-Type, and other available varieties", icon: <path d="M12 2c1 4-1 7-4 9 4 0 7-2 8-6 .8 5-2 10-8 11C4 15 4 8 8 5c-1 3 0 5 1 6 0-4 1-7 3-9z" /> },
  { title: "Sizes", text: KERNEL_SIZES.join(", "), icon: <><rect x="2.5" y="8" width="19" height="8" rx="1" /><path d="M6.5 8v3M10.5 8v4M14.5 8v3M18.5 8v4" /></> },
  { title: "Grades", text: "USDA grades and commercial specifications available upon request", icon: <><circle cx="12" cy="10" r="6.5" /><path d="m9.2 10 2 2 3.6-3.8M8.5 15.5 7 21l5-2.5 5 2.5-1.5-5.5" /></> },
  { title: "Crop", text: "Current crop and other available crop positions", icon: <><rect x="3.5" y="5" width="17" height="15" rx="1.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></> },
  { title: "Packaging", text: "50 lb cartons or other commercial packaging upon request", icon: <><path d="M12 3 3.5 7v10L12 21l8.5-4V7L12 3z" /><path d="M3.5 7 12 11l8.5-4M12 11v10" /></> },
  { title: "Volume", text: "Pallet, truckload, and container quantities, subject to availability", icon: <><rect x="2.5" y="7" width="19" height="11" rx="1" /><path d="M6.5 7v11M10.5 7v11M14.5 7v11M18.5 7v11" /></> },
];

/**
 * SECTION `product-specs` — trang Home.
 * Ảnh kho + ảnh tàu (blob) và danh sách thông số có icon.
 * CMS: heading, subheading, content, metadata.configurations [{title,text}] (hoặc chuỗi).
 */
export function ProductSpecs({ section }: StandardSectionProps) {
  const rows = (
    metaOf<Array<string | { title?: string; text?: string }>>(section, "configurations") ?? SPECS
  )
    .map((entry, index) => {
      const item =
        typeof entry === "string"
          ? { title: entry, text: "" }
          : { title: entry.title ?? "", text: entry.text ?? "" };
      return { ...item, icon: SPECS[index % SPECS.length].icon };
    })
    .filter((item) => item.title);

  return (
    <section className="section" id={section?.sectionKey ?? "product-specs"}>
      <div className="container">
        <div className="split orders-layout">
          <div className="split-copy orders-copy reveal">
            <p className="eyebrow">{section?.subheading ?? "Product Specifications"}</p>
            <h2>{section?.heading ?? "Almonds Matched to Your Market"}</h2>
            <RichIntro html={section?.content ?? DEFAULT_INTRO} />
            <a href="#request-quote" className="btn btn-ghost-dark btn-sm" style={{ marginTop: "1.2rem" }}>
              Send Your Specifications
            </a>
            <figure className="orders-warehouse-figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/bulk-warehouse.jpg"
                alt="Palletized cartons stored in a commercial warehouse"
                loading="lazy"
              />
            </figure>
          </div>

          <div className="orders-side reveal">
            <figure className="blob-figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/ship-color.webp" alt="Container ship being loaded at a port terminal" loading="lazy" />
              <span className="blob-badge" aria-hidden="true">50 lb<br />Cartons</span>
            </figure>
            <ul className="config-rows">
              {rows.map((row) => (
                <li key={row.title}>
                  <IconBadge>{row.icon}</IconBadge>
                  <div>
                    <h4>{row.title}</h4>
                    {row.text ? <p>{row.text}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

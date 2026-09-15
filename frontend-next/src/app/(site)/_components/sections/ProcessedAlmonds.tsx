import type { ReactNode } from "react";
import { ALMOND_ICON } from "./shared";
import { RichIntro, metaOf, type StandardSectionProps } from "./section-content";

type ProcessedItem = { name: string; text: string; image: string; imagePosition?: string; icon: ReactNode };

const PROCESSED: ProcessedItem[] = [
  { name: "Blanched", text: "Whole kernels with skins removed — clean, ivory color for marzipan, confectionery, and premium bakery use.", image: "/images/products/blanched.jpg", icon: <><path d="M12 3.5 C 16 7.5 18.5 12 17.2 15.9 C 16.2 18.9 7.8 18.9 6.8 15.9 C 5.5 12 8 7.5 12 3.5 Z" /><path d="M19.5 4.5v3M18 6h3" /></> },
  { name: "Sliced", text: "Thin, uniform slices — natural or blanched — for bakery toppings, cereals, salads, and garnishes.", image: "/images/products/sliced.jpg", icon: <><ellipse cx="9" cy="12" rx="4" ry="8" /><ellipse cx="15" cy="12" rx="4" ry="8" opacity="0.55" /></> },
  { name: "Slivered", text: "Julienne-cut blanched kernels — a classic format for baking, rice dishes, pilafs, and garnish.", image: "/images/products/slivered.jpg", imagePosition: "center 5%", icon: <path d="M6 20 9 4M11.5 20 14.5 4M17 20 20 4" /> },
  { name: "Diced", text: "Uniform pieces in a range of cut sizes — ideal for chocolate and candy inclusions, ice cream, and granola.", image: "/images/products/diced.jpg", icon: <><rect x="4" y="4" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" /></> },
  { name: "Almond Flour & Meal", text: "Finely ground blanched flour and natural meal — for gluten-free baking, macarons, coatings, and ingredient blends.", image: "/images/products/almond-flour.jpg", icon: <><path d="M4 19c0-5 3.6-8.5 8-8.5s8 3.5 8 8.5H4z" /><circle cx="9" cy="6" r="0.4" /><circle cx="13.5" cy="4.5" r="0.4" /><circle cx="16.5" cy="7.5" r="0.4" /><circle cx="12" cy="8" r="0.4" /></> },
  { name: "Custom Specifications", text: "Other cuts, grades, and preparations can be evaluated according to your application and destination market.", image: "/images/products/custom-specifications.jpg", icon: <><path d="M4 21v-4M4 13v-2M4 7V3M12 21v-8M12 9V3M20 21v-2M20 15V3" /><circle cx="4" cy="15" r="2" /><circle cx="12" cy="11" r="2" /><circle cx="20" cy="17" r="2" /></> },
];

const DEFAULT_INTRO =
  "<p>Value-added almond formats prepared to commercial specifications for bakery, confectionery, dairy, and ingredient applications.</p>";

/**
 * SECTION `processed-almonds` — trang Products (nền kem).
 * Lưới thẻ định dạng chế biến + dải 2 ảnh + dải ghi chú "Product selection".
 * CMS: heading, subheading, content, metadata.formats [] (tên trùng bộ mặc định giữ ảnh + mô tả + icon).
 */
export function ProcessedAlmonds({ section }: StandardSectionProps) {
  const names = (metaOf<string[]>(section, "formats") ?? []).filter(Boolean);
  const cards: ProcessedItem[] =
    names.length > 0
      ? names.map(
          (name) =>
            PROCESSED.find((item) => item.name === name) ?? {
              name,
              text: "",
              image: "/images/products/custom-specifications.jpg",
              imagePosition: "center",
              icon: ALMOND_ICON,
            },
        )
      : PROCESSED;

  return (
    <section className="section section-tint" id={section?.sectionKey ?? "processed-almonds"}>
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow">{section?.subheading ?? "Processed Almonds"}</p>
          <h2>{section?.heading ?? "Processed Formats for Food Manufacturing"}</h2>
          <RichIntro html={section?.content ?? DEFAULT_INTRO} />
        </div>

        <div className="processed-grid">
          {cards.map((card, index) => (
            <article className="processed-card reveal" key={card.name}>
              <div className="processed-card-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={`${card.name} almond format`}
                  loading="lazy"
                  style={{ objectPosition: card.imagePosition ?? "center" }}
                />
                <span className="processed-card-number">Format {String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="processed-card-body">
                <span className="icon-badge processed-card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {card.icon}
                  </svg>
                </span>
                <h3>{card.name}</h3>
                {card.text ? <p>{card.text}</p> : null}
              </div>
            </article>
          ))}
        </div>

        <div className="photo-strip photo-strip-2 reveal">
          <figure>
            <div className="photo-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/almond-tart.webp" alt="Almond tart beside a bowl of blanched almond kernels" loading="lazy" />
            </div>
            <figcaption>Almond flour &amp; bakery applications</figcaption>
          </figure>
          <figure>
            <div className="photo-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/kernels-study.jpg" alt="California almonds — in shell, cracked open, natural and blanched kernels" loading="lazy" />
            </div>
            <figcaption>In-shell, natural &amp; blanched kernels</figcaption>
          </figure>
        </div>

        <div className="selection-band reveal">
          <p>
            <strong>Product selection</strong> is based on variety, grade, size, crop year,
            specifications, packaging, and intended application.
          </p>
        </div>
      </div>
    </section>
  );
}

import { ALMOND_ICON, IconBadge } from "./shared";
import { RichIntro, metaOf, type StandardSectionProps } from "./section-content";

const NATURAL = [
  { name: "Nonpareil", text: "The flagship California variety — light color and a smooth, attractive kernel, the benchmark for premium snacking and retail programs.", image: "/images/products/nonpareil.jpg", imagePosition: "center 64%" },
  { name: "Independence", text: "A widely planted modern variety with an appealing, versatile kernel — a dependable option for snacking and blanching alike.", image: "/images/products/independence.jpg", imagePosition: "64% 64%" },
  { name: "Monterey", text: "A larger, elongated kernel and a dependable workhorse for industrial, ingredient, and manufacturing use.", image: "/images/products/monterey.jpg", imagePosition: "center" },
  { name: "Carmel", text: "A versatile kernel well suited to roasting, blanching, and a broad range of food-manufacturing applications.", image: "/images/products/carmel.jpg", imagePosition: "center 68%" },
  { name: "Butte", text: "A smaller, rounded Mission-type kernel — popular for snack mixes, roasting, and export markets where compact sizes are preferred.", image: "/images/products/butte.jpg", imagePosition: "center" },
  { name: "Padre", text: "A hardy Mission-type variety with a plump kernel and rich flavor — well suited to roasting, dicing, and processed applications.", image: "/images/products/padre.jpg", imagePosition: "55% center" },
];

const DEFAULT_INTRO =
  "<p>Whole natural kernels with skin on, sourced from California&rsquo;s leading varieties for snacking, roasting, retail, and industrial programs.</p>";

/**
 * SECTION `natural-almonds` — trang Products.
 * Ảnh lớn + lưới thẻ giống hạnh nhân tự nhiên (ảnh, số thứ tự, mô tả).
 * CMS: heading, subheading, content, metadata.varieties [] (tên trùng bộ mặc định giữ ảnh + mô tả).
 */
export function NaturalAlmonds({ section }: StandardSectionProps) {
  const names = (metaOf<string[]>(section, "varieties") ?? []).filter(Boolean);
  const cards =
    names.length > 0
      ? names.map(
          (name) =>
            NATURAL.find((item) => item.name === name) ?? {
              name,
              text: "",
              image: "/images/products/nonpareil.jpg",
              imagePosition: "center 64%",
            },
        )
      : NATURAL;

  return (
    <section className="section" id={section?.sectionKey ?? "natural-almonds"}>
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow">{section?.subheading ?? "Natural Almonds"}</p>
          <h2>{section?.heading ?? "Natural Almond Kernels"}</h2>
          <RichIntro html={section?.content ?? DEFAULT_INTRO} />
        </div>

        <figure className="photo-frame section-photo reveal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/almonds-ramekin.webp" alt="Raw natural almond kernels in a white ramekin on a wooden board" />
        </figure>

        <div className="natural-grid">
          {cards.map((card, index) => (
            <article className="natural-product-card reveal" key={card.name}>
              <figure className="natural-card-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={`${card.name} natural almond kernels`}
                  loading="lazy"
                  style={{ objectPosition: card.imagePosition }}
                />
              </figure>
              <div className="natural-card-body">
                <div className="natural-card-meta">
                  <IconBadge>{ALMOND_ICON}</IconBadge>
                  <span>Variety {String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3>{card.name}</h3>
                {card.text ? <p>{card.text}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

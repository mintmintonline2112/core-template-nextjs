import type { Metadata } from "next";
import Link from "next/link";
import { SizeScale } from "@/app/(site)/_components/SizeScale";
import { getCmsPage, sectionMap } from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("products");
  return buildPageMetadata({
    title: page?.metaTitle ?? "Our Products",
    description:
      page?.metaDescription ??
      "Natural and processed California almonds — Nonpareil, Independence, Monterey, Carmel, Butte, Padre kernels plus blanched, sliced, slivered, diced almonds and almond flour.",
    path: siteRoutes.products,
    image: page?.ogImagePath,
    canonical: page?.canonicalUrl,
  });
}

const ALMOND_ICON = (
  <>
    <path d="M12 3.5 C 16 7.5 18.5 12 17.2 15.9 C 16.2 18.9 7.8 18.9 6.8 15.9 C 5.5 12 8 7.5 12 3.5 Z" />
    <path d="M12 7.2 C 13.8 9.6 14.9 12.1 14.3 14.5" />
  </>
);

const NATURAL = [
  { name: "Nonpareil", text: "The flagship California variety — light color and a smooth, attractive kernel, the benchmark for premium snacking and retail programs.", tags: ["Snacking", "Retail", "Premium"] },
  { name: "Independence", text: "A widely planted modern variety with an appealing, versatile kernel — a dependable option for snacking and blanching alike.", tags: ["Snacking", "Blanching"] },
  { name: "Monterey", text: "A larger, elongated kernel and a dependable workhorse for industrial, ingredient, and manufacturing use.", tags: ["Manufacturing", "Ingredient"] },
  { name: "Carmel", text: "A versatile kernel well suited to roasting, blanching, and a broad range of food-manufacturing applications.", tags: ["Roasting", "Blanching"] },
  { name: "Butte", text: "A smaller, rounded Mission-type kernel — popular for snack mixes, roasting, and export markets where compact sizes are preferred.", tags: ["Snack Mixes", "Export"] },
  { name: "Padre", text: "A hardy Mission-type variety with a plump kernel and rich flavor — well suited to roasting, dicing, and processed applications.", tags: ["Roasting", "Dicing"] },
];

const PROCESSED = [
  { name: "Blanched", text: "Whole kernels with skins removed — clean, ivory color for marzipan, confectionery, and premium bakery use.", tags: ["Marzipan", "Confectionery", "Bakery"], icon: <><path d="M12 3.5 C 16 7.5 18.5 12 17.2 15.9 C 16.2 18.9 7.8 18.9 6.8 15.9 C 5.5 12 8 7.5 12 3.5 Z" /><path d="M19.5 4.5v3M18 6h3" /></> },
  { name: "Sliced", text: "Thin, uniform slices — natural or blanched — for bakery toppings, cereals, salads, and garnishes.", tags: ["Bakery", "Cereals", "Toppings"], icon: <><ellipse cx="9" cy="12" rx="4" ry="8" /><ellipse cx="15" cy="12" rx="4" ry="8" opacity="0.55" /></> },
  { name: "Slivered", text: "Julienne-cut blanched kernels — a classic format for baking, rice dishes, pilafs, and garnish.", tags: ["Baking", "Culinary", "Garnish"], icon: <path d="M6 20 9 4M11.5 20 14.5 4M17 20 20 4" /> },
  { name: "Diced", text: "Uniform pieces in a range of cut sizes — ideal for chocolate and candy inclusions, ice cream, and granola.", tags: ["Chocolate", "Ice Cream", "Granola"], icon: <><rect x="4" y="4" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" /></> },
  { name: "Almond Flour & Meal", text: "Finely ground blanched flour and natural meal — for gluten-free baking, macarons, coatings, and ingredient blends.", tags: ["Gluten-Free", "Macarons", "Ingredient"], icon: <><path d="M4 19c0-5 3.6-8.5 8-8.5s8 3.5 8 8.5H4z" /><circle cx="9" cy="6" r="0.4" /><circle cx="13.5" cy="4.5" r="0.4" /><circle cx="16.5" cy="7.5" r="0.4" /><circle cx="12" cy="8" r="0.4" /></> },
  { name: "Custom Specifications", text: "Other cuts, grades, and preparations can be evaluated according to your application and destination market.", tags: ["On Request"], icon: <><path d="M4 21v-4M4 13v-2M4 7V3M12 21v-8M12 9V3M20 21v-2M20 15V3" /><circle cx="4" cy="15" r="2" /><circle cx="12" cy="11" r="2" /><circle cx="20" cy="17" r="2" /></> },
];

const SIZES = ["18/20", "20/22", "23/25", "25/27", "27/30", "30/32", "32/34"];

function Card({ name, text, tags, icon }: { name: string; text: string; tags: string[]; icon: React.ReactNode }) {
  return (
    <article className="why-card reveal">
      <span className="icon-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </span>
      <h3>{name}</h3>
      {text ? <p>{text}</p> : null}
      {tags.length > 0 ? (
        <div className="chip-row">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default async function ProductsPage() {
  // Nội dung sửa được từ admin; API tắt → fallback hardcode.
  const page = await getCmsPage("products");
  const sections = sectionMap(page);
  const sec = (key: string) => sections.get(key);
  const heading = (key: string, fallback: string) => sec(key)?.heading ?? fallback;
  const eyebrow = (key: string, fallback: string) => sec(key)?.subheading ?? fallback;

  const Intro = ({ sectionKey, fallback }: { sectionKey: string; fallback: string }) => (
    <div
      className="section-intro"
      dangerouslySetInnerHTML={{
        __html: sanitizeRichText(sec(sectionKey)?.content ?? `<p>${fallback}</p>`),
      }}
    />
  );

  // Danh sách giống/định dạng/cỡ hạt từ metadata section; tên trùng bộ mặc định
  // thì giữ nguyên mô tả + chip, tên mới thì chỉ hiện tên.
  const cmsNames = (key: string, field: string) =>
    ((sec(key)?.metadata?.[field] as string[] | undefined) ?? []).filter(Boolean);

  const naturalNames = cmsNames("natural-almonds", "varieties");
  const naturalCards =
    naturalNames.length > 0
      ? naturalNames.map(
          (name) => NATURAL.find((item) => item.name === name) ?? { name, text: "", tags: [] },
        )
      : NATURAL;

  const processedNames = cmsNames("processed-almonds", "formats");
  const processedCards =
    processedNames.length > 0
      ? processedNames.map(
          (name) =>
            PROCESSED.find((item) => item.name === name) ?? {
              name,
              text: "",
              tags: [],
              icon: ALMOND_ICON,
            },
        )
      : PROCESSED;

  const sizeList = cmsNames("kernel-sizes", "sizes");
  const kernelSizes = sizeList.length > 0 ? sizeList : SIZES;

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="eyebrow eyebrow-gold reveal">{page?.eyebrow ?? "California Almonds"}</p>
          <h1 className="reveal">{page?.title ?? "Our Products"}</h1>
          <p className="lead reveal">
            {page?.lead ??
              "We source California almonds based on customer requirements, applications, and market demand — from natural kernels to processed formats for food manufacturing."}
          </p>
        </div>
      </section>

      <section className="section" id="natural">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{eyebrow("natural-almonds", "Natural Almonds")}</p>
            <h2>{heading("natural-almonds", "Natural Almond Kernels")}</h2>
            <Intro
              sectionKey="natural-almonds"
              fallback="Whole natural kernels with skin on, sourced from California's leading varieties for snacking, roasting, retail, and industrial programs."
            />
          </div>

          <figure className="photo-frame section-photo reveal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/almonds-ramekin.webp" alt="Raw natural almond kernels in a white ramekin on a wooden board" />
          </figure>

          <div className="why-grid">
            {naturalCards.map((item) => (
              <Card key={item.name} {...item} icon={ALMOND_ICON} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint" id="processed">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{eyebrow("processed-almonds", "Processed Almonds")}</p>
            <h2>{heading("processed-almonds", "Processed Formats for Food Manufacturing")}</h2>
            <Intro
              sectionKey="processed-almonds"
              fallback="Value-added almond formats prepared to commercial specifications for bakery, confectionery, dairy, and ingredient applications."
            />
          </div>

          <div className="why-grid">
            {processedCards.map((item) => (
              <Card key={item.name} {...item} />
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

      <section className="section" id="sizes">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{eyebrow("kernel-sizes", "Specifications")}</p>
            <h2>{heading("kernel-sizes", "Common Kernel Sizes")}</h2>
            <Intro
              sectionKey="kernel-sizes"
              fallback="Natural almond kernels are graded by count per ounce. The most commonly traded California sizes:"
            />
          </div>

          <div className="product-sizes reveal">
            <SizeScale sizes={kernelSizes} />
            <p className="panel-footnote">
              Different grades, varieties and specifications may be available depending on crop
              and market conditions.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container reveal">
          <p className="eyebrow eyebrow-gold">Ready to Order?</p>
          <h2>Request Specifications or a Commercial Quotation</h2>
          <p>
            Tell us your variety, size, volume, packaging, and destination — our team will
            respond with current availability and pricing.
          </p>
          <div className="cta-band-actions">
            <Link href={siteRoutes.contact} className="btn btn-gold">Request a B2B Quote</Link>
            <Link href={siteRoutes.homeSection('markets')} className="btn btn-ghost">See Our Markets</Link>
          </div>
        </div>
      </section>
    </>
  );
}

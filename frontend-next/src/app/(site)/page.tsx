import type { Metadata } from "next";
import Link from "next/link";
import { QuoteForm } from "@/app/(site)/_components/forms";
import { SizeScale } from "@/app/(site)/_components/SizeScale";
import { SourcingBlock } from "@/app/(site)/_components/SourcingBlock";
import { type SourcingSlide } from "@/app/(site)/_components/SourcingSlider";
import { WorldMap } from "@/app/(site)/_components/WorldMap";
import { getCmsPage, mediaUrl, sectionMap } from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { KERNEL_SIZES } from "@/config/products";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("home");
  return buildPageMetadata({
    title: page?.metaTitle ?? "Prime Nuts USA — California Almonds to the World",
    absoluteTitle: true,
    description:
      page?.metaDescription ??
      "Reliable California almond supply for U.S. and global markets.",
    path: siteRoutes.home,
    image: page?.ogImagePath,
    canonical: page?.canonicalUrl,
  });
}

const ALMOND_GLYPH = (
  <>
    <path d="M16 3 C 22 9 26 16 24 22 C 22.5 27 9.5 27 8 22 C 6 16 10 9 16 3 Z" />
    <path d="M16 8 C 19 12 20.6 15.8 19.7 19.5" strokeWidth="1" />
  </>
);

function FloatGlyph({ style, dur, delay, width }: { style: React.CSSProperties; dur: string; delay?: string; width: number }) {
  return (
    <svg
      style={{ ...style, width, ["--float-dur" as string]: dur, ["--float-delay" as string]: delay } as React.CSSProperties}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      {ALMOND_GLYPH}
    </svg>
  );
}

const CONFIGS = [
  { title: "Full Container Load — FCL", text: "20′ & 40′ ocean containers.", icon: <><rect x="2.5" y="7" width="19" height="11" rx="1" /><path d="M6.5 7v11M10.5 7v11M14.5 7v11M18.5 7v11" /></> },
  { title: "50 lb Cartons", text: "The industry-standard export carton.", icon: <><path d="M12 3 3.5 7v10L12 21l8.5-4V7L12 3z" /><path d="M3.5 7 12 11l8.5-4M12 11v10" /></> },
  { title: "Palletized Shipments", text: "Stretch-wrapped, export-ready.", icon: <><rect x="4" y="4" width="7" height="7" rx="0.5" /><rect x="13" y="4" width="7" height="7" rx="0.5" /><path d="M3 15h18M3 19h18M6 15v4M12 15v4M18 15v4" /></> },
  { title: "Bulk Packaging", text: "Totes & bins for manufacturing lines.", icon: <><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></> },
  { title: "Custom Commercial Packaging", text: "Tailored on request.", icon: <><path d="M4 21v-4M4 13v-2M4 7V3M12 21v-8M12 9V3M20 21v-2M20 15V3" /><circle cx="4" cy="15" r="2" /><circle cx="12" cy="11" r="2" /><circle cx="20" cy="17" r="2" /></> },
];

const CHAIN = [
  { title: "Growers", text: "Established California orchards" },
  { title: "Hullers & Shellers", text: "First-stage processing" },
  { title: "Processors", text: "Sizing, sorting & grading" },
  { title: "Packers", text: "Export-ready packaging" },
  { title: "Prime Nuts USA", text: "Sourcing & trade coordination" },
  { title: "Buyers & Distributors", text: "U.S. & global markets" },
];

const DOCS = [
  "Commercial Invoice", "Packing List", "Certificate of Origin", "Phytosanitary Certificate",
  "Bill of Lading", "Product Specifications", "Food Safety Documentation",
];

const WHY = [
  { title: "California Based", text: "At the source of the world's leading almond industry.", icon: <><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></> },
  { title: "Reliable Sourcing", text: "Established growers, handlers, processors, and packers.", icon: <path d="M12 2c1 4-1 7-4 9 4 0 7-2 8-6 .8 5-2 10-8 11C4 15 4 8 8 5c-1 3 0 5 1 6 0-4 1-7 3-9z" /> },
  { title: "B2B Focus", text: "Built for commercial buyers and wholesale volumes.", icon: <><path d="M12 4v16M5 8l7-4 7 4" /><path d="M5 8l-2.5 6a3.5 3.5 0 0 0 7 0L7 8M19 8l-2.5 6a3.5 3.5 0 0 0 7 0L21 8" /><path d="M8 20h8" /></> },
  { title: "Flexible Specifications", text: "Varieties, sizes, grades, and packaging to your spec.", icon: <><path d="M4 21v-4M4 13v-2M4 7V3M12 21v-8M12 9V3M20 21v-2M20 15V3" /><circle cx="4" cy="15" r="2" /><circle cx="12" cy="11" r="2" /><circle cx="20" cy="17" r="2" /></> },
  { title: "Global Trade Support", text: "We move California almonds into international markets.", icon: <path d="M3 17h18l-2 4H5l-2-4zM6 17V9l4-2v10M14 17V7l4 2v8" /> },
  { title: "Long-Term Partnerships", text: "Consistency, transparency, and reliable execution.", icon: <path d="M12 21c-5-3.5-8-7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 4-3 7.5-8 11z" /> },
];

const VARIETIES = [
  { name: "Nonpareil", text: "The flagship variety — the benchmark for premium snacking and retail." },
  { name: "Carmel", text: "A versatile kernel for roasting, blanching, and manufacturing." },
  { name: "Monterey", text: "A larger kernel — the workhorse for industrial and ingredient use." },
  { name: "California Varieties", text: "Interchangeable varieties, ideal for processing and blanching." },
];

const SIZES = [...KERNEL_SIZES];

// Ảnh tròn cho dàn varieties (tham chiếu Kaffa) — lặp vòng khi CMS thêm giống mới.
const VARIETY_PHOTOS = [
  "/images/almonds-ramekin.webp",
  "/images/almonds-table.webp",
  "/images/kernels-study.jpg",
  "/images/green-almond.jpg",
];

const SERVE = [
  "Importers", "Distributors", "Wholesalers", "Food Manufacturers", "Roasters",
  "Retail Suppliers", "Private-Label Brands", "Food-Service Companies",
];

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="icon-badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

function ServeLine({ items }: { items: string[] }) {
  return (
    <p className="serve-copy" aria-hidden="true">
      {items.map((item) => (
        <span key={item} style={{ display: "contents" }}>
          <span>{item}</span>
          <span className="serve-dot">✦</span>
        </span>
      ))}
    </p>
  );
}

/** Giá trị thống kê hero: chữ số hiển thị lớn, ký tự ′ / + thu nhỏ (stat-suffix). */
function StatValue({ value }: { value: string }) {
  const count = /^\d/.test(value) ? Number.parseInt(value, 10) : undefined;
  const parts = value.split(/([′+])/).filter(Boolean);
  return (
    <dd data-count={count}>
      {parts.map((part, index) =>
        part === "′" || part === "+" ? (
          <span className="stat-suffix" key={index}>{part}</span>
        ) : (
          part
        ),
      )}
    </dd>
  );
}

export default async function HomePage() {
  // Nội dung sửa được từ admin (/admin/pages, /admin/page-sections);
  // API tắt hoặc thiếu section → dùng fallback hardcode bên dưới.
  const page = await getCmsPage("home");
  const sections = sectionMap(page);
  const sec = (key: string) => sections.get(key);
  const heading = (key: string, fallback: string) => sec(key)?.heading ?? fallback;
  const eyebrow = (key: string, fallback: string) => sec(key)?.subheading ?? fallback;

  const Intro = ({
    sectionKey,
    fallback,
    className = "section-intro",
  }: {
    sectionKey: string;
    fallback: string;
    className?: string;
  }) => (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: sanitizeRichText(sec(sectionKey)?.content ?? `<p>${fallback}</p>`),
      }}
    />
  );

  const heroStats = ((sec("hero")?.metadata?.stats as
    | Array<{ label?: string; value?: string }>
    | undefined) ?? [
    { label: "Export Markets", value: "30+" },
    { label: "Kernel Sizes", value: "7" },
    { label: "FCL Containers", value: "20′ & 40′" },
  ]).filter((stat) => stat.label && stat.value);

  const whyReasons = ((sec("why-us")?.metadata?.reasons as
    | Array<{ title?: string; text?: string }>
    | undefined) ?? WHY).filter((reason) => reason.title);

  const quoteChecklist = ((sec("quote-cta")?.metadata?.checklist as string[] | undefined) ?? [
    "Almond variety", "Size & grade", "Required volume", "Packaging",
    "Destination country & port", "Preferred Incoterm",
  ]).filter(Boolean);

  // Slider sourcing từ CMS: metadata.slides = [{ image, caption?, alt? }].
  // Ảnh /images/... là ảnh tĩnh của frontend; còn lại (uploads/...) trỏ về backend.
  const resolveImage = (path: string) =>
    path.startsWith("/images/") ? path : (mediaUrl(path) ?? path);

  const sourcingSlides: SourcingSlide[] | undefined = (
    sec("sourcing")?.metadata?.slides as
      | Array<{ image?: string; caption?: string; alt?: string }>
      | undefined
  )
    ?.filter((slide) => typeof slide.image === "string" && slide.image)
    .map((slide) => ({
      src: resolveImage(slide.image!),
      caption: slide.caption,
      alt: slide.alt,
    }));

  // Chuỗi cung ứng từ CMS: metadata.chain = [chuỗi tên bước].
  const cmsChain = (sec("sourcing")?.metadata?.chain as string[] | undefined)?.filter(Boolean);
  const chainSteps =
    cmsChain && cmsChain.length > 0
      ? cmsChain.map((title, index) => ({
          title,
          text: title === CHAIN[index]?.title ? CHAIN[index].text : "",
        }))
      : CHAIN;

  // Chip khu vực bản đồ (markets.regions — dùng field name làm nhãn).
  const mapRegions = (
    sec("markets")?.metadata?.regions as
      | Array<{ key?: string; name?: string }>
      | undefined
  )
    ?.filter((region) => region.key && region.name)
    .map((region) => ({ key: region.key!, label: region.name! }));

  // Khối sản phẩm tổng quan: varieties, sizes, dải ảnh.
  const overviewMeta = sec("products-overview")?.metadata as
    | {
        varieties?: string[];
        sizes?: string[];
        photos?: Array<{ image?: string; caption?: string }>;
      }
    | undefined;
  const overviewSizes = (overviewMeta?.sizes ?? SIZES).filter(Boolean);
  const overviewVarieties =
    overviewMeta?.varieties && overviewMeta.varieties.length > 0
      ? overviewMeta.varieties.filter(Boolean).map((name) => ({
          name,
          text: VARIETIES.find((variety) => variety.name === name)?.text ?? "",
        }))
      : VARIETIES;
  const overviewPhotos = overviewMeta?.photos
    ?.filter((photo) => typeof photo.image === "string" && photo.image)
    .map((photo) => ({
      src: resolveImage(photo.image!),
      caption: photo.caption ?? "",
    })) ?? [
    { src: "/images/kernels-study.jpg", caption: "In-shell, natural & blanched kernels" },
    { src: "/images/almonds-ramekin.webp", caption: "Ready for snacking & retail" },
    { src: "/images/hero-branch.jpg", caption: "Fresh crop on the tree" },
  ];

  // Cấu hình đóng gói (orders.configurations — chuỗi hoặc {title,text}); icon giữ theo thiết kế.
  const ordersConfigs = (
    (sec("orders")?.metadata?.configurations as
      | Array<string | { title?: string; text?: string }>
      | undefined) ?? CONFIGS
  )
    .map((entry, index) => {
      const item =
        typeof entry === "string"
          ? { title: entry, text: "" }
          : { title: entry.title ?? "", text: entry.text ?? "" };
      return { ...item, icon: CONFIGS[index % CONFIGS.length].icon };
    })
    .filter((item) => item.title);

  // Chứng từ & Incoterms (logistics.documents / logistics.incoterms).
  const logisticsDocs = (
    (sec("logistics")?.metadata?.documents as
      | Array<string | { label?: string; note?: string }>
      | undefined) ?? [
      ...DOCS,
      { label: "Laboratory Testing Documentation", note: "when applicable" },
    ]
  )
    .map((entry) =>
      typeof entry === "string"
        ? { label: entry, note: undefined }
        : { label: entry.label ?? "", note: entry.note },
    )
    .filter((doc) => doc.label);
  const incoterms = (
    (sec("logistics")?.metadata?.incoterms as string[] | undefined) ?? ["FOB", "CFR", "CIF"]
  ).filter(Boolean);

  // Danh sách khách hàng chạy marquee (who-we-serve.audiences).
  const audiences = (
    (sec("who-we-serve")?.metadata?.audiences as string[] | undefined) ?? SERVE
  ).filter(Boolean);

  // Chia 2 dòng marquee chạy ngược chiều (trên → phải, dưới → trái).
  const serveHalf = Math.ceil(audiences.length / 2);
  const serveRowA = audiences.slice(0, serveHalf);
  const serveRowB = audiences.slice(serveHalf);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero" id="home">
        <div className="hero-float" aria-hidden="true">
          <FloatGlyph style={{ top: "14%", left: "5%" }} width={40} dur="15s" />
          <FloatGlyph style={{ top: "64%", left: "11%" }} width={26} dur="19s" delay="-6s" />
          <FloatGlyph style={{ top: "8%", right: "14%" }} width={30} dur="17s" delay="-3s" />
          <FloatGlyph style={{ top: "78%", right: "6%" }} width={44} dur="21s" delay="-10s" />
          <FloatGlyph style={{ top: "40%", left: "44%" }} width={20} dur="14s" delay="-8s" />
        </div>
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow eyebrow-gold reveal">
              {eyebrow("hero", "California Almonds to the World")}
            </p>
            <h1 className="reveal">
              {heading("hero", "Reliable California Almond Supply for U.S. & Global Markets")}
            </h1>
            <div
              className="hero-cms reveal"
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(
                  sec("hero")?.content ??
                    "<p>Prime Nuts USA connects California almond supply with commercial buyers in the U.S. and worldwide — reliable supply, consistent quality, competitive B2B pricing.</p>",
                ),
              }}
            />
            <div className="hero-actions reveal">
              <a href="#quote" className="btn btn-gold">Request a B2B Quote</a>
              <a href="#products" className="btn btn-ghost">Explore Our Almonds</a>
            </div>

            <dl className="hero-stats reveal">
              {heroStats.map((stat) => (
                <div className="stat" key={stat.label}>
                  <dt>{stat.label}</dt>
                  <StatValue value={stat.value!} />
                </div>
              ))}
            </dl>
          </div>

        </div>

        {/* Ảnh hero tràn mép phải — không khung, không viền, cạnh trái hòa vào nền */}
        <figure className="hero-figure-bleed reveal" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/orchard-rows.jpg" alt="" />
        </figure>
      </section>

      {/* ============ MARKETS ============ */}
      <section className="section" id="markets">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{eyebrow("markets", "Global Distribution")}</p>
            <h2>{heading("markets", "From California to Global Markets")}</h2>
            <Intro
              sectionKey="markets"
              fallback="California sits at the center of the global almond industry — we give B2B buyers direct access to it, at home and abroad."
            />
          </div>
          <WorldMap regions={mapRegions} />
        </div>
      </section>

      {/* ============ PRODUCTS OVERVIEW ============ */}
      <section className="section section-tint" id="products">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{eyebrow("products-overview", "Our California Almonds")}</p>
            <h2>{heading("products-overview", "Almonds for Wholesale, Distribution & Food Manufacturing")}</h2>
            <Intro
              sectionKey="products-overview"
              fallback="Natural almond kernels in the varieties, sizes, and grades your market requires."
            />
          </div>

          {/* Dàn ảnh tròn đánh số kiểu Kaffa — mỗi giống một vòng tròn + badge số */}
          <ul className="variety-circles reveal">
            {overviewVarieties.map((variety, index) => (
              <li className="variety-circle" key={variety.name}>
                <div className="vc-photo">
                  <span className="vc-num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={VARIETY_PHOTOS[index % VARIETY_PHOTOS.length]}
                    alt={variety.name}
                    loading="lazy"
                  />
                </div>
                <h4>{variety.name}</h4>
                {variety.text ? <p>{variety.text}</p> : null}
              </li>
            ))}
          </ul>

          <div className="product-sizes product-sizes-band reveal">
            <h3 className="panel-title"><span className="panel-title-line" />Common Sizes</h3>
            <SizeScale sizes={overviewSizes} />
            <p className="panel-footnote">
              Different grades, varieties and specifications may be available depending on crop
              and market conditions.
            </p>
          </div>

          <div className="photo-strip reveal">
            {overviewPhotos.map((photo) => (
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
            Also available: processed almonds — blanched, sliced, slivered, diced, and almond flour.
            <br />
            <Link href={siteRoutes.products} className="btn btn-ghost-dark btn-sm" style={{ marginTop: "1rem" }}>
              Explore the Full Product Range
            </Link>
          </p>
        </div>
      </section>

      {/* ============ BULK & CONTAINER ============ */}
      <section className="section" id="orders">
        <div className="container">
          <div className="split orders-layout">
            <div className="split-copy orders-copy reveal">
              <p className="eyebrow">{eyebrow("orders", "Bulk & Container Orders")}</p>
              <h2>{heading("orders", "Built for B2B Supply")}</h2>
              <Intro
                sectionKey="orders"
                fallback="From domestic wholesale volumes to international container shipments."
              />
              <figure className="orders-warehouse-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/bulk-warehouse.jpg"
                  alt="Palletized cartons stored in a commercial warehouse"
                  loading="lazy"
                />
              </figure>
            </div>

            {/* Ảnh blob hữu cơ + badge tròn (tham chiếu Kaffa) và các dòng cấu hình đóng gói */}
            <div className="orders-side reveal">
              <figure className="blob-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/ship-color.webp" alt="Container ship being loaded at a port terminal" loading="lazy" />
                <span className="blob-badge" aria-hidden="true">20&prime; &amp; 40&prime;<br />FCL</span>
              </figure>
              <ul className="config-rows">
                {ordersConfigs.map((config) => (
                  <li key={config.title}>
                    <IconBadge>{config.icon}</IconBadge>
                    <div>
                      <h4>{config.title}</h4>
                      {config.text ? <p>{config.text}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SOURCING ============ */}
      <section className="section section-dark" id="sourcing">
        <div className="container">
          <div className="section-head section-head-light reveal">
            <p className="eyebrow eyebrow-gold">{eyebrow("sourcing", "California Sourcing")}</p>
            <h2>{heading("sourcing", "Access to California's Almond Supply Network")}</h2>
            <Intro
              sectionKey="sourcing"
              fallback="Our California location plugs us straight into the world's most established almond supply chain."
            />
          </div>

          <SourcingBlock slides={sourcingSlides} chain={chainSteps} />

          <p className="section-note section-note-light reveal">
            This sourcing network allows us to respond to different product specifications,
            commercial volumes, and destination requirements.
          </p>
        </div>
      </section>

      {/* ============ LOGISTICS ============ */}
      <section className="section" id="logistics">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{eyebrow("logistics", "Export & Logistics Support")}</p>
            <h2>{heading("logistics", "More Than Almond Supply")}</h2>
            <Intro
              sectionKey="logistics"
              fallback="Depending on the transaction and destination, we coordinate or support:"
            />
          </div>

          {/* Chứng từ kẹp hai bên ảnh tròn trung tâm (tham chiếu Kaffa) */}
          <div className="doc-features reveal">
            <ul className="doc-col doc-col-left">
              {logisticsDocs.slice(0, Math.ceil(logisticsDocs.length / 2)).map((doc, index) => (
                <li key={doc.label}>
                  <span className="doc-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div className="doc-body">
                    <h4>{doc.label}</h4>
                    {doc.note ? <span className="doc-note">{doc.note}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
            <div className="doc-center">
              <div className="doc-center-ring">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/container-ship.jpg" alt="" loading="lazy" />
              </div>
            </div>
            <ul className="doc-col doc-col-right">
              {logisticsDocs.slice(Math.ceil(logisticsDocs.length / 2)).map((doc, index) => (
                <li key={doc.label}>
                  <span className="doc-num" aria-hidden="true">
                    {String(Math.ceil(logisticsDocs.length / 2) + index + 1).padStart(2, "0")}
                  </span>
                  <div className="doc-body">
                    <h4>{doc.label}</h4>
                    {doc.note ? <span className="doc-note">{doc.note}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="incoterm-band reveal">
            <p>Quotations available under common international trade terms:</p>
            <div className="incoterm-chips">
              {incoterms.map((term) => (
                <span key={term}>{term}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHO WE SERVE ============ */}
      <section className="serve-band" id="serve">
        <div className="container reveal">
          <p className="eyebrow">{heading("who-we-serve", "Who We Serve")}</p>
          <p className="sr-only">{audiences.join(", ")}</p>
          {/* 2 dòng chạy vô hạn ngược chiều; nhân 4 bản để vòng lặp liền mạch */}
          <div className="serve-marquee">
            <div className="serve-track serve-track-right">
              {[0, 1, 2, 3].map((copy) => (
                <ServeLine items={serveRowA} key={copy} />
              ))}
            </div>
          </div>
          {serveRowB.length > 0 ? (
            <div className="serve-marquee">
              <div className="serve-track serve-track-left">
                {[0, 1, 2, 3].map((copy) => (
                  <ServeLine items={serveRowB} key={copy} />
                ))}
              </div>
            </div>
          ) : null}
          <p className="serve-sub">
            Established buyers and new-market developers alike are welcome.
          </p>
        </div>
      </section>

      {/* ============ WHY US ============ */}
      <section className="section section-tint" id="why">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{eyebrow("why-us", "Why Prime Nuts USA?")}</p>
            <h2>{heading("why-us", "A Partner Built Around Commercial Buyers")}</h2>
          </div>

          <div className="why-grid">
            {whyReasons.map((reason, index) => (
              <article className="why-card reveal" key={reason.title}>
                <IconBadge>{WHY[index % WHY.length].icon}</IconBadge>
                <h3>{reason.title}</h3>
                <p>{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ QUOTE ============ */}
      <section className="section quote" id="quote">
        <div className="container quote-inner">
          <div className="quote-copy reveal">
            <p className="eyebrow eyebrow-gold">
              {eyebrow("quote-cta", "Become a Prime Nuts Distribution Partner")}
            </p>
            <h2>{heading("quote-cta", "Let's Grow Together")}</h2>
            <Intro
              sectionKey="quote-cta"
              fallback="Importers, distributors, wholesalers, food manufacturers — tell us what you need:"
            />
            <ul className="quote-checklist">
              {quoteChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="quote-followup">
              We&apos;ll respond with current availability and pricing.
            </p>
          </div>

          <QuoteForm />
        </div>
      </section>
    </>
  );
}

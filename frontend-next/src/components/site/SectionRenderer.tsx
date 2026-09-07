import Link from "next/link";
import { QuoteForm } from "@/components/site/forms";
import { SourcingSlider, type SourcingSlide } from "@/components/site/SourcingSlider";
import { WorldMap, type MapRegion } from "@/components/site/WorldMap";
import { mediaUrl } from "@/lib/cms";
import { sanitizeRichText } from "@/lib/sanitize";
import type { PageSection } from "@/types/cms";

/**
 * Render một page-section như một COMPONENT tái sử dụng trên trang CMS tự do.
 * Loại component đọc từ metadata._component (form admin tự gắn khi chọn),
 * fallback theo sectionKey — nên section của 4 trang chuẩn cũng nhận diện được.
 * Không khớp loại nào → khối generic (eyebrow + heading + nội dung + ảnh).
 */

type Meta = Record<string, unknown>;

export function componentType(section: PageSection): string {
  const meta = (section.metadata ?? {}) as Meta;
  return typeof meta._component === "string" && meta._component
    ? meta._component
    : section.sectionKey;
}

const resolveImage = (path: string) =>
  path.startsWith("/images/") ? path : (mediaUrl(path) ?? path);

function strings(meta: Meta, key: string): string[] {
  const raw = meta[key];
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string" && !!v) : [];
}

function items(meta: Meta, key: string): Array<Record<string, string>> {
  const raw = meta[key];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return { label: item, title: item };
      if (item && typeof item === "object") {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(item as Meta)) {
          if (typeof v === "string") out[k] = v;
        }
        return out;
      }
      return null;
    })
    .filter((item): item is Record<string, string> => !!item && Object.keys(item).length > 0);
}

/* Bộ icon dùng lại cho card/list (xoay vòng theo thứ tự). */
const CARD_ICONS: React.ReactNode[] = [
  <><path key="a" d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle key="b" cx="12" cy="10" r="2.6" /></>,
  <path key="a" d="M12 2c1 4-1 7-4 9 4 0 7-2 8-6 .8 5-2 10-8 11C4 15 4 8 8 5c-1 3 0 5 1 6 0-4 1-7 3-9z" />,
  <><path key="a" d="M12 4v16M5 8l7-4 7 4" /><path key="b" d="M5 8l-2.5 6a3.5 3.5 0 0 0 7 0L7 8M19 8l-2.5 6a3.5 3.5 0 0 0 7 0L21 8" /><path key="c" d="M8 20h8" /></>,
  <><path key="a" d="M4 21v-4M4 13v-2M4 7V3M12 21v-8M12 9V3M20 21v-2M20 15V3" /><circle key="b" cx="4" cy="15" r="2" /><circle key="c" cx="12" cy="11" r="2" /><circle key="d" cx="20" cy="17" r="2" /></>,
  <path key="a" d="M3 17h18l-2 4H5l-2-4zM6 17V9l4-2v10M14 17V7l4 2v8" />,
  <path key="a" d="M12 21c-5-3.5-8-7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 4-3 7.5-8 11z" />,
];

const ALMOND_ICON = (
  <>
    <path d="M12 3.5 C 16 7.5 18.5 12 17.2 15.9 C 16.2 18.9 7.8 18.9 6.8 15.9 C 5.5 12 8 7.5 12 3.5 Z" />
    <path d="M12 7.2 C 13.8 9.6 14.9 12.1 14.3 14.5" />
  </>
);

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="icon-badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

function Head({ section, light = false }: { section: PageSection; light?: boolean }) {
  if (!section.heading && !section.subheading && !section.content) return null;
  return (
    <div className={`section-head${light ? " section-head-light" : ""} reveal`}>
      {section.subheading ? (
        <p className={`eyebrow${light ? " eyebrow-gold" : ""}`}>{section.subheading}</p>
      ) : null}
      {section.heading ? <h2>{section.heading}</h2> : null}
      {section.content ? (
        <div
          className="section-intro"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(section.content) }}
        />
      ) : null}
    </div>
  );
}

function Shell({
  tint,
  dark,
  id,
  children,
}: {
  tint?: boolean;
  dark?: boolean;
  id: string;
  children: React.ReactNode;
}) {
  const cls = dark ? "section section-dark" : tint ? "section section-tint" : "section";
  return (
    <section className={cls} id={id}>
      <div className="container">{children}</div>
    </section>
  );
}

export function SectionRenderer({ section, index }: { section: PageSection; index: number }) {
  const type = componentType(section);
  const meta = (section.metadata ?? {}) as Meta;
  const tint = index % 2 === 1;
  const id = section.sectionKey;

  switch (type) {
    case "sourcing": {
      const slides: SourcingSlide[] = items(meta, "slides")
        .filter((slide) => slide.image)
        .map((slide) => ({ src: resolveImage(slide.image), caption: slide.caption, alt: slide.alt }));
      const chain = strings(meta, "chain");
      return (
        <Shell dark id={id}>
          <Head section={section} light />
          {slides.length > 0 ? <SourcingSlider slides={slides} /> : null}
          {chain.length > 0 ? (
            <ol className="chain reveal">
              {chain.map((title, i) => (
                <li
                  className={`chain-step${/prime nuts/i.test(title) ? " chain-step-highlight" : ""}`}
                  key={title}
                >
                  <span className="chain-num">{i + 1}</span>
                  <h3>{title}</h3>
                  <p></p>
                </li>
              ))}
            </ol>
          ) : null}
        </Shell>
      );
    }

    case "hero": {
      const stats = items(meta, "stats").filter((s) => s.label && s.value);
      return (
        <Shell tint={tint} id={id}>
          <Head section={section} />
          {stats.length > 0 ? (
            <dl className="hero-stats stats-band reveal">
              {stats.map((stat) => (
                <div className="stat" key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd data-count={/^\d/.test(stat.value) ? Number.parseInt(stat.value, 10) : undefined}>
                    {stat.value.split(/([′+])/).filter(Boolean).map((part, i) =>
                      part === "′" || part === "+" ? (
                        <span className="stat-suffix" key={i}>{part}</span>
                      ) : (
                        part
                      ),
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Shell>
      );
    }

    case "markets": {
      const regions: MapRegion[] = items(meta, "regions")
        .filter((r) => r.key && r.name)
        .map((r) => ({ key: r.key, label: r.name }));
      return (
        <Shell tint={tint} id={id}>
          <Head section={section} />
          <WorldMap regions={regions.length > 0 ? regions : undefined} />
        </Shell>
      );
    }

    case "products-overview": {
      const varieties = strings(meta, "varieties");
      const sizes = strings(meta, "sizes");
      const photos = items(meta, "photos").filter((p) => p.image);
      return (
        <Shell tint={tint} id={id}>
          <Head section={section} />
          {varieties.length > 0 ? (
            <div className="why-grid">
              {varieties.map((name) => (
                <article className="why-card reveal" key={name}>
                  <IconBadge>{ALMOND_ICON}</IconBadge>
                  <h3>{name}</h3>
                </article>
              ))}
            </div>
          ) : null}
          {sizes.length > 0 ? (
            <div className="product-sizes reveal" style={{ marginTop: "2rem" }}>
              <div className="size-grid">
                {sizes.map((size) => (
                  <div className="size-cell" key={size}>
                    <span className="size-num">{size}</span>
                    <span className="size-cap">kernels / oz</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {photos.length > 0 ? (
            <div className={`photo-strip${photos.length === 2 ? " photo-strip-2" : ""} reveal`}>
              {photos.map((photo) => (
                <figure key={photo.image}>
                  <div className="photo-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolveImage(photo.image)} alt={photo.caption ?? ""} loading="lazy" />
                  </div>
                  {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          ) : null}
        </Shell>
      );
    }

    case "orders": {
      const configs = items(meta, "configurations").filter((c) => c.title || c.label);
      return (
        <Shell tint={tint} id={id}>
          <Head section={section} />
          <ul className="config-list reveal">
            {configs.map((config, i) => (
              <li key={config.title ?? config.label}>
                <IconBadge>{CARD_ICONS[i % CARD_ICONS.length]}</IconBadge>
                <div>
                  <h4>{config.title ?? config.label}</h4>
                  {config.text ? <p>{config.text}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </Shell>
      );
    }

    case "logistics": {
      const documents = items(meta, "documents").filter((d) => d.label);
      const incoterms = strings(meta, "incoterms");
      return (
        <Shell tint={tint} id={id}>
          <Head section={section} />
          {documents.length > 0 ? (
            <ul className="doc-grid reveal">
              {documents.map((doc) => (
                <li key={doc.label}>
                  <span className="doc-check" aria-hidden="true">✓</span>
                  {doc.label}
                  {doc.note ? <span className="doc-note">{doc.note}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {incoterms.length > 0 ? (
            <div className="incoterm-band reveal">
              <p>
                Shipping quotations may be available under common international trade terms:
              </p>
              <div className="incoterm-chips">
                {incoterms.map((term) => (
                  <span key={term}>{term}</span>
                ))}
              </div>
            </div>
          ) : null}
        </Shell>
      );
    }

    case "who-we-serve": {
      const audiences = strings(meta, "audiences");
      if (audiences.length === 0) return <GenericBlock section={section} tint={tint} />;
      const line = (
        <p className="serve-copy" aria-hidden="true">
          {audiences.map((item) => (
            <span key={item} style={{ display: "contents" }}>
              <span>{item}</span>
              <span className="serve-dot">✦</span>
            </span>
          ))}
        </p>
      );
      return (
        <section className="serve-band" id={id}>
          <div className="container reveal">
            {section.heading ? <p className="eyebrow">{section.heading}</p> : null}
            <p className="sr-only">{audiences.join(", ")}</p>
            <div className="serve-marquee">
              <div className="serve-track">
                {line}
                {line}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "why-us": {
      const reasons = items(meta, "reasons").filter((r) => r.title);
      return (
        <Shell tint={tint} id={id}>
          <Head section={section} />
          <div className="why-grid">
            {reasons.map((reason, i) => (
              <article className="why-card reveal" key={reason.title}>
                <IconBadge>{CARD_ICONS[i % CARD_ICONS.length]}</IconBadge>
                <h3>{reason.title}</h3>
                {reason.text ? <p>{reason.text}</p> : null}
              </article>
            ))}
          </div>
        </Shell>
      );
    }

    case "quote-cta": {
      const checklist = strings(meta, "checklist");
      return (
        <section className="section quote" id={id}>
          <div className="container quote-inner">
            <div className="quote-copy reveal">
              {section.subheading ? (
                <p className="eyebrow eyebrow-gold">{section.subheading}</p>
              ) : null}
              {section.heading ? <h2>{section.heading}</h2> : null}
              {section.content ? (
                <div
                  className="section-intro"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(section.content) }}
                />
              ) : null}
              {checklist.length > 0 ? (
                <ul className="quote-checklist">
                  {checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <QuoteForm />
          </div>
        </section>
      );
    }

    case "natural-almonds":
    case "processed-almonds": {
      const names = strings(meta, type === "natural-almonds" ? "varieties" : "formats");
      return (
        <Shell tint={tint} id={id}>
          <Head section={section} />
          <div className="why-grid">
            {names.map((name) => (
              <article className="why-card reveal" key={name}>
                <IconBadge>{ALMOND_ICON}</IconBadge>
                <h3>{name}</h3>
              </article>
            ))}
          </div>
        </Shell>
      );
    }

    case "kernel-sizes": {
      const sizes = strings(meta, "sizes");
      return (
        <Shell tint={tint} id={id}>
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

    case "contact-info": {
      const fields: Array<{ name: string; label: string; icon: React.ReactNode }> = [
        { name: "location", label: "Location", icon: CARD_ICONS[0] },
        { name: "email", label: "Email", icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 7 8.5-7" /></> },
        { name: "phone", label: "Phone / WhatsApp", icon: <path d="M5 4h4l1.8 4.5-2.3 1.7a13 13 0 0 0 5.3 5.3l1.7-2.3L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.8 20 4 13.2 3.5 5.6A1.5 1.5 0 0 1 5 4z" /> },
        { name: "businessHours", label: "Business Hours", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></> },
      ];
      const rows = fields.filter((f) => typeof meta[f.name] === "string" && meta[f.name]);
      return (
        <Shell tint={tint} id={id}>
          <Head section={section} />
          <ul className="contact-info-list reveal" style={{ maxWidth: "34rem" }}>
            {rows.map((field) => (
              <li key={field.name}>
                <IconBadge>{field.icon}</IconBadge>
                <div>
                  <h4>{field.label}</h4>
                  <p>{meta[field.name] as string}</p>
                </div>
              </li>
            ))}
          </ul>
        </Shell>
      );
    }

    case "quotation-checklist": {
      const checklist = strings(meta, "checklist");
      return (
        <Shell tint={tint} id={id}>
          <Head section={section} />
          <ul className="doc-grid reveal">
            {checklist.map((item) => (
              <li key={item}>
                <span className="doc-check" aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Shell>
      );
    }

    default:
      return <GenericBlock section={section} tint={tint} />;
  }
}

/** Khối generic: eyebrow + heading + nội dung rich-text + ảnh minh họa. */
function GenericBlock({ section, tint }: { section: PageSection; tint: boolean }) {
  const image = mediaUrl(section.mediaPath);
  return (
    <Shell tint={tint} id={section.sectionKey}>
      {(section.subheading || section.heading) ? (
        <div className="section-head reveal">
          {section.subheading ? <p className="eyebrow">{section.subheading}</p> : null}
          {section.heading ? <h2>{section.heading}</h2> : null}
        </div>
      ) : null}
      {image ? (
        <figure className="photo-frame section-photo reveal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={section.heading ?? ""} loading="lazy" />
        </figure>
      ) : null}
      {section.content ? (
        <div
          className="post-content reveal"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(section.content) }}
        />
      ) : null}
    </Shell>
  );
}

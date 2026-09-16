import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import {
  ALMOND_ICON,
  Head,
  IconBadge,
  InlineNote,
  Shell,
  anchorId,
  iconFor,
  items,
  layoutOf,
  paragraphs,
  resolveImage,
  str,
  strings,
  type SectionProps,
} from "./shared";

const LAYOUTS = ["circles", "toggle", "names", "photo", "badge"] as const;

type Card = Record<string, string>; // title, text, short, image, imagePosition, icon

const pad = (n: number) => String(n + 1).padStart(2, "0");

/**
 * SECTION `media-cards` — lưới thẻ có ảnh, mỗi thẻ một giống / định dạng sản phẩm.
 * layout `circles`: ảnh tròn đánh số + tên + mô tả (hàng ngang).
 * layout `toggle`:  thẻ lớn bo góc (gradient navy hoặc ảnh nền), công tắc "Short
 *                   version" đổi mô tả ngắn / đầy đủ (kèm cỡ hạt), nút kính mờ.
 * layout `names`:   thẻ tên có icon hạnh nhân (không ảnh).
 * layout `photo`:   ảnh lớn phía trên + lưới thẻ ảnh có số thứ tự (trang Products).
 * layout `badge`:   thẻ ảnh có nhãn số + icon, dải ảnh và dòng ghi chú (trang Products).
 * CMS: heading, subheading, content, metadata.items [{title,text,short,image,imagePosition,icon}],
 * sizes [] + toggleLabel (toggle), image (photo), photos [{image,caption}] + note (badge),
 * ctaLabel/ctaHref (toggle), itemLabel (photo/badge: chữ trước số thứ tự).
 */
export function MediaCards({ section, index = 0 }: SectionProps) {
  const id = anchorId(section, "media-cards");
  const layout = layoutOf(section, LAYOUTS, "circles");
  const cards: Card[] = items(section, "items").filter((card) => card.title);

  if (layout === "toggle") return <ToggleCards id={id} section={section} cards={cards} />;
  if (layout === "photo") return <PhotoCards id={id} section={section} cards={cards} />;
  if (layout === "badge") return <BadgeCards id={id} section={section} cards={cards} />;

  if (layout === "names") {
    return (
      <Shell tint={index % 2 === 1} id={id}>
        <Head section={section} />
        {cards.length > 0 ? (
          <div className="why-grid">
            {cards.map((card) => (
              <article className="why-card reveal" key={card.title}>
                <IconBadge>{ALMOND_ICON}</IconBadge>
                <h3>{card.title}</h3>
              </article>
            ))}
          </div>
        ) : null}
      </Shell>
    );
  }

  return (
    <section className="section section-tint section-flow" id={id}>
      <div className="container">
        <Head section={section} />
        {cards.length > 0 ? (
          <ul className="variety-circles reveal">
            {cards.map((card, i) => (
              <li className="variety-circle" key={`${card.title}-${i}`}>
                <div className="vc-photo">
                  <span className="vc-num" aria-hidden="true">{pad(i)}</span>
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveImage(card.image)} alt={card.title} loading="lazy" />
                  ) : null}
                </div>
                <h4>{card.title}</h4>
                {card.text ? <p>{card.text}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

/* Thẻ lớn + công tắc "Short version" (checkbox + CSS :has, không cần JavaScript). */
function ToggleCards({ id, section, cards }: { id: string } & Pick<SectionProps, "section"> & { cards: Card[] }) {
  const sizes = strings(section, "sizes");
  const toggleLabel = str(section, "toggleLabel") ?? "Short version";
  const ctaLabel = str(section, "ctaLabel");
  const ctaHref = str(section, "ctaHref");

  return (
    <section className="section section-tint almond-variety-cards" id={id}>
      <div className="container">
        <Head section={section} />

        {cards.length > 0 ? (
          <div className="avc-grid">
            {cards.map((card, i) => {
              const detail = card.text || card.short || "";
              return (
                <article
                  className={`avc-card reveal ${card.image ? "is-photo" : "is-gradient"}${card.short ? "" : " no-short"}`}
                  key={`${card.title}-${i}`}
                >
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="avc-bg" src={resolveImage(card.image)} alt="" loading="lazy" />
                  ) : null}

                  <div className="avc-body">
                    <div className="avc-top">
                      <label className="avc-switch">
                        <input type="checkbox" role="switch" className="avc-switch-input" defaultChecked />
                        <span className="avc-switch-track" aria-hidden="true">
                          <span className="avc-switch-dot" />
                        </span>
                        <span className="avc-switch-label">{toggleLabel}</span>
                      </label>
                      <span className="avc-num" aria-hidden="true">{pad(i)}</span>
                    </div>

                    <h3 className="avc-title">{card.title}</h3>

                    {card.short ? <p className="avc-short">{card.short}</p> : null}
                    <div className="avc-detail">
                      {paragraphs(detail).map((paragraph, p) => (
                        <p key={p}>{paragraph}</p>
                      ))}
                      {sizes.length > 0 ? (
                        <ul className="avc-sizes" aria-label="Available sizes">
                          {sizes.map((size) => (
                            <li key={size}>{size}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    {ctaLabel ? (
                      <a className="avc-cta" href={ctaHref || "#request-quote"}>
                        <span className="avc-cta-dot" aria-hidden="true" />
                        {ctaLabel}
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        <InlineNote text={str(section, "note")} className="section-note reveal" />
      </div>
    </section>
  );
}

/* Ảnh lớn + lưới thẻ ảnh (trang Products — giống tự nhiên). */
function PhotoCards({ id, section, cards }: { id: string } & Pick<SectionProps, "section"> & { cards: Card[] }) {
  const image = str(section, "image");
  const itemLabel = str(section, "itemLabel") ?? "Variety";

  return (
    <section className="section" id={id}>
      <div className="container">
        <Head section={section} />

        {image ? (
          <figure className="photo-frame section-photo reveal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveImage(image)} alt={str(section, "imageAlt") ?? section?.heading ?? ""} />
          </figure>
        ) : null}

        {cards.length > 0 ? (
          <div className="natural-grid">
            {cards.map((card, i) => (
              <article className="natural-product-card reveal" key={`${card.title}-${i}`}>
                {card.image ? (
                  <figure className="natural-card-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImage(card.image)}
                      alt={`${card.title} natural almond kernels`}
                      loading="lazy"
                      style={card.imagePosition ? { objectPosition: card.imagePosition } : undefined}
                    />
                  </figure>
                ) : null}
                <div className="natural-card-body">
                  <div className="natural-card-meta">
                    <IconBadge>{ALMOND_ICON}</IconBadge>
                    <span>{`${itemLabel} ${pad(i)}`}</span>
                  </div>
                  <h3>{card.title}</h3>
                  {card.text ? <p>{card.text}</p> : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* Thẻ ảnh có nhãn số + icon, dải ảnh, dòng ghi chú (trang Products — định dạng chế biến). */
function BadgeCards({ id, section, cards }: { id: string } & Pick<SectionProps, "section"> & { cards: Card[] }) {
  const photos = items(section, "photos").filter((photo) => photo.image);
  const note = str(section, "note");
  const itemLabel = str(section, "itemLabel") ?? "Format";

  return (
    <section className="section section-tint" id={id}>
      <div className="container">
        <Head section={section} />

        {cards.length > 0 ? (
          <div className="processed-grid">
            {cards.map((card, i) => (
              <article className="processed-card reveal" key={`${card.title}-${i}`}>
                <div className="processed-card-media">
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImage(card.image)}
                      alt={`${card.title} almond format`}
                      loading="lazy"
                      style={{ objectPosition: card.imagePosition || "center" }}
                    />
                  ) : null}
                  <span className="processed-card-number">{`${itemLabel} ${pad(i)}`}</span>
                </div>
                <div className="processed-card-body">
                  <IconBadge className="icon-badge processed-card-icon">{iconFor(card.icon, i)}</IconBadge>
                  <h3>{card.title}</h3>
                  {card.text ? <p>{card.text}</p> : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {photos.length > 0 ? (
          <div className={`photo-strip${photos.length === 2 ? " photo-strip-2" : ""} reveal`}>
            {photos.map((photo, i) => (
              <figure key={`${photo.image}-${i}`}>
                <div className="photo-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImage(photo.image)} alt={photo.caption ?? ""} loading="lazy" />
                </div>
                {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : null}

        {note ? (
          <div className="selection-band reveal">
            <p dangerouslySetInnerHTML={{ __html: sanitizeRichText(note) }} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

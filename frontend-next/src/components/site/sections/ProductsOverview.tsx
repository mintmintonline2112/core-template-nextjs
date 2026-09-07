import { ALMOND_ICON, Head, IconBadge, Shell, items, meta, resolveImage, strings, type SectionProps } from "./shared";

/** Giới thiệu sản phẩm — metadata: varieties[], sizes[], photos[{image,caption}]. */
export function ProductsOverview({ section, index }: SectionProps) {
  const m = meta(section);
  const varieties = strings(m, "varieties");
  const sizes = strings(m, "sizes");
  const photos = items(m, "photos").filter((p) => p.image);
  return (
    <Shell tint={index % 2 === 1} id={section.sectionKey}>
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

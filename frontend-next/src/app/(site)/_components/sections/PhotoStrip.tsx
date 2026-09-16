import { Cta, Head, anchorId, inlineHtml, items, resolveImage, str, type SectionProps } from "./shared";

/**
 * SECTION `photo-strip` — dải ảnh khung bo góc có chú thích, dưới là dòng ghi chú
 * + nút. Có heading/subheading thì hiện đầu khối, không thì chỉ có dải ảnh (để
 * ghép liền dưới khối khác — section-flow).
 * CMS: subheading, heading, content, metadata.items [{image,caption}], note,
 * ctaLabel, ctaHref.
 */
export function PhotoStrip({ section }: SectionProps) {
  const photos = items(section, "items").filter((photo) => photo.image);
  const note = str(section, "note");
  const ctaLabel = str(section, "ctaLabel");

  return (
    <section className="section section-tint section-flow" id={anchorId(section, "photo-strip")}>
      <div className="container">
        <Head section={section} />

        {photos.length > 0 ? (
          <div className={`photo-strip${photos.length === 2 ? " photo-strip-2" : ""} reveal`}>
            {photos.map((photo, index) => (
              <figure key={`${photo.image}-${index}`}>
                <div className="photo-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImage(photo.image)} alt={photo.caption ?? ""} loading="lazy" />
                </div>
                {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : null}

        {note || ctaLabel ? (
          <p className="section-note reveal">
            {note ? <span dangerouslySetInnerHTML={{ __html: inlineHtml(note) }} /> : null}
            {note && ctaLabel ? <br /> : null}
            <Cta label={ctaLabel} href={str(section, "ctaHref")} className="btn btn-ghost-dark btn-sm" style={{ marginTop: "1rem" }} />
          </p>
        ) : null}
      </div>
    </section>
  );
}

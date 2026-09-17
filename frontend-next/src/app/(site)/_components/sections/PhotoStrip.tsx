import {
  PHOTO_FRAME,
  SECTION,
  SECTION_FLOW,
  SECTION_NOTE,
  SECTION_TINT,
} from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Cta,
  Head,
  anchorId,
  inlineHtml,
  items,
  resolveImage,
  str,
  type SectionProps,
} from "./shared";

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
    <section
      className={cn(SECTION, SECTION_TINT, SECTION_FLOW)}
      id={anchorId(section, "photo-strip")}
    >
      <div className="site-container">
        <Head section={section} />

        {photos.length > 0 ? (
          <div
            data-stagger="70"
            className={cn(
              "reveal reveal-group mt-[clamp(2.5rem,5vw,3.5rem)] grid grid-cols-3 gap-6",
              photos.length === 2 && "grid-cols-2",
            )}
          >
            {photos.map((photo, index) => (
              <figure className="m-0" key={`${photo.image}-${index}`}>
                <div className={cn(PHOTO_FRAME, "aspect-4/3")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImage(photo.image)}
                    alt={photo.caption ?? ""}
                    loading="lazy"
                  />
                </div>
                {photo.caption ? (
                  <figcaption className="mt-3 text-center font-display text-base text-ink-faint italic">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        ) : null}

        {note || ctaLabel ? (
          <p className={cn(SECTION_NOTE, "reveal")}>
            {note ? (
              <span dangerouslySetInnerHTML={{ __html: inlineHtml(note) }} />
            ) : null}
            {note && ctaLabel ? <br /> : null}
            <Cta
              label={ctaLabel}
              href={str(section, "ctaHref")}
              className="btn btn-ghost-dark btn-sm"
              style={{ marginTop: "1rem" }}
            />
          </p>
        ) : null}
      </div>
    </section>
  );
}

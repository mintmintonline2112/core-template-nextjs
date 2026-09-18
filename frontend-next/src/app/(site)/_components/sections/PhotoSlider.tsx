import { PhotoCarousel } from "@/app/(site)/_components/PhotoCarousel";
import {
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
 * SECTION `photo-slider` — anh em của `photo-strip` (cùng dữ liệu, cùng khung
 * ảnh + chú thích), nhưng dải ảnh là slider: máy tính 3 ảnh, dưới 1080px 2 ảnh,
 * điện thoại 1 ảnh, trượt từng ảnh, không tự chạy (PhotoCarousel.tsx). Dưới là
 * dòng ghi chú + nút. Có heading/subheading thì hiện đầu khối.
 * CMS: subheading, heading, content, metadata.items [{image,caption}], note,
 * ctaLabel, ctaHref.
 */
export function PhotoSlider({ section }: SectionProps) {
  const photos = items(section, "items")
    .filter((photo) => photo.image)
    .map((photo) => ({
      src: resolveImage(photo.image),
      caption: photo.caption,
    }));
  const note = str(section, "note");
  const ctaLabel = str(section, "ctaLabel");

  return (
    <section
      className={cn(SECTION, SECTION_TINT, SECTION_FLOW)}
      id={anchorId(section, "photo-slider")}
    >
      <div className="site-container">
        <Head section={section} />

        {photos.length > 0 ? (
          <PhotoCarousel
            className="mt-[clamp(2.5rem,5vw,3.5rem)]"
            photos={photos}
            label={section?.heading || "Thư viện ảnh"}
          />
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

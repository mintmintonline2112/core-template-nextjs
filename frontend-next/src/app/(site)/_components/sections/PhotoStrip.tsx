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
 *
 * Style bằng Tailwind, nhưng vẫn GIỮ class `photo-strip`/`photo-strip-2` (dù
 * đã có class Tailwind tương đương) vì hai lý do: (1) bố cục `badge`/`photo`
 * của MediaCards.tsx còn dùng — xoá CSS khi component đó chuyển xong; (2)
 * SiteEffects.tsx bắt `.photo-strip.reveal` để so le hiệu ứng hiện dần từng
 * ảnh — bỏ class là mất hiệu ứng so le đó dù layout không đổi. Giá trị CSS
 * cũ của `.photo-strip *` đã copy y hệt sang Tailwind nên giữ cả hai không
 * gây lệch giao diện. `.photo-frame` (khung ảnh viền vàng khi hover) là hạ
 * tầng dùng chung, giữ nguyên className, chỉ thêm tỷ lệ khung riêng.
 */
export function PhotoStrip({ section }: SectionProps) {
  const photos = items(section, "items").filter((photo) => photo.image);
  const note = str(section, "note");
  const ctaLabel = str(section, "ctaLabel");

  return (
    <section
      className="section section-tint section-flow"
      id={anchorId(section, "photo-strip")}
    >
      <div className="container">
        <Head section={section} />

        {photos.length > 0 ? (
          <div
            className={cn(
              "photo-strip reveal mt-[clamp(2.5rem,5vw,3.5rem)] grid grid-cols-3 gap-[1.4rem]",
              photos.length === 2 && "photo-strip-2 grid-cols-2",
            )}
          >
            {photos.map((photo, index) => (
              <figure className="m-0" key={`${photo.image}-${index}`}>
                <div className="photo-frame aspect-4/3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImage(photo.image)}
                    alt={photo.caption ?? ""}
                    loading="lazy"
                  />
                </div>
                {photo.caption ? (
                  <figcaption className="mt-[0.7rem] text-center text-[0.95rem] text-ink-faint italic">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        ) : null}

        {note || ctaLabel ? (
          <p className="section-note reveal">
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

import { Fragment } from "react";
import { PHOTO_FRAME, SECTION } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Cta,
  Head,
  IconBadge,
  RichIntro,
  anchorId,
  iconFor,
  items,
  resolveImage,
  str,
  type SectionProps,
} from "./shared";

/**
 * SECTION `spec-sheet` — phiếu thông số sản phẩm: đầu khối căn giữa, bảng 2 cột
 * (tên thông số có icon │ giá trị) trong thẻ trắng, bên cạnh là ảnh dọc có nhãn
 * tròn; dưới bảng là ghi chú + nút.
 * Nội dung (content): đoạn ĐẦU hiện dưới tiêu đề, các đoạn SAU hiện dưới bảng.
 * CMS: subheading, heading, content, metadata.items [{title,text,icon}], image,
 * imagePosition (object-position, chọn bằng cách bấm lên ảnh trong admin),
 * imageAlt, badge (dùng | để xuống dòng), ctaLabel, ctaHref.
 */
export function SpecSheet({ section }: SectionProps) {
  const rows = items(section, "items").filter((row) => row.title);
  const image = str(section, "image");
  const imagePosition = str(section, "imagePosition");
  const badge = str(section, "badge");
  const ctaLabel = str(section, "ctaLabel");

  // Tách đoạn <p> đầu làm intro, phần còn lại làm ghi chú dưới bảng.
  const paragraphs = section?.content?.match(/<p[\s\S]*?<\/p>/g) ?? [];
  const intro = paragraphs.length > 0 ? paragraphs[0] : section?.content;
  const note = paragraphs.slice(1).join("");

  return (
    <section className={SECTION} id={anchorId(section, "spec-sheet")}>
      <div className="site-container">
        <Head
          section={section ? { ...section, content: intro ?? null } : section}
        />

        {rows.length > 0 || image ? (
          <div
            className={cn(
              "grid items-stretch gap-8 max-[900px]:grid-cols-1",
              image && rows.length > 0
                ? "grid-cols-[minmax(0,1fr)_minmax(0,22rem)]"
                : "mx-auto max-w-4xl grid-cols-1",
            )}
          >
            {rows.length > 0 ? (
              <div className="reveal overflow-hidden rounded-lg border border-line bg-paper shadow-soft">
                <dl data-stagger="50" className="reveal-group m-0">
                  {rows.map((row, i) => (
                    <div
                      key={`${row.title}-${i}`}
                      className="grid grid-cols-[minmax(12rem,0.4fr)_minmax(0,1fr)] border-b border-line-soft last:border-b-0 even:bg-cream/60 max-[640px]:grid-cols-1"
                    >
                      <dt className="flex items-center gap-3 border-r border-line-soft px-6 py-4 font-display text-base font-semibold text-navy-900 max-[640px]:border-r-0 max-[640px]:pb-1">
                        <IconBadge className="h-10 w-10 [&>svg]:h-5 [&>svg]:w-5">
                          {iconFor(row.icon, i)}
                        </IconBadge>
                        {row.title}
                      </dt>
                      <dd className="m-0 flex items-center px-6 py-4 text-base text-ink-soft max-[640px]:pt-1 max-[640px]:pl-19">
                        {row.text}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {image ? (
              // Nhãn tròn nằm ngoài khung ảnh: khung phải giữ overflow-hidden vì
              // hiệu ứng .photo-frame (effects.css, GSAP) phóng / trượt ảnh bên trong.
              <figure className="reveal relative m-0 min-h-80 max-[900px]:order-first max-[900px]:aspect-video max-[900px]:min-h-0">
                <div className={cn(PHOTO_FRAME, "h-full")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImage(image)}
                    alt={str(section, "imageAlt") ?? ""}
                    loading="lazy"
                    style={
                      imagePosition
                        ? { objectPosition: imagePosition }
                        : undefined
                    }
                  />
                </div>
                {badge ? (
                  <span
                    className="absolute -bottom-3 -left-3 z-1 grid h-23.5 w-23.5 -rotate-6 place-items-center rounded-full border-4 border-cream bg-gold-400 text-center text-sm leading-snug font-bold tracking-xs text-navy-900 shadow-badge"
                    aria-hidden="true"
                  >
                    {badge.split(/\s*\|\s*|\n/).map((line, i, all) => (
                      <Fragment key={i}>
                        {line}
                        {i < all.length - 1 ? <br /> : null}
                      </Fragment>
                    ))}
                  </span>
                ) : null}
              </figure>
            ) : null}
          </div>
        ) : null}

        {note || ctaLabel ? (
          <div className="reveal mx-auto mt-12 max-w-160 text-center">
            <RichIntro
              html={note}
              className="font-display text-base text-ink-faint italic [&_p]:m-0 [&_p+p]:mt-2"
            />
            <Cta
              label={ctaLabel}
              href={str(section, "ctaHref")}
              className="btn btn-ghost-dark btn-sm"
              style={{ marginTop: note ? "1.25rem" : 0 }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

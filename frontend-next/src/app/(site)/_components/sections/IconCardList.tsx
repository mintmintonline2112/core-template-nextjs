import { Fragment } from "react";
import { Eyebrow, SECTION } from "@/app/(site)/_components/ui";
import {
  Cta,
  Head,
  IconBadge,
  RichIntro,
  Shell,
  anchorId,
  iconFor,
  items,
  layoutOf,
  resolveImage,
  str,
  type SectionProps,
} from "./shared";

const LAYOUTS = ["list", "split"] as const;

/** Ảnh blob: bo góc hữu cơ 8 giá trị — quá dài cho `rounded-[]`, khai thẳng thuộc tính. */
const BLOB_RADIUS = "[border-radius:62%_38%_56%_44%/48%_60%_40%_52%]";

/**
 * SECTION `icon-card-list` — mỗi dòng một mục có icon (tiêu đề + mô tả).
 * layout `list`:  đầu khối + danh sách dòng icon.
 * layout `split`: chữ + nút + ảnh lớn bên trái; ảnh blob có nhãn + danh sách
 *                 dòng icon bên phải (thông số sản phẩm trang chủ).
 * CMS: heading, subheading, content, metadata.items [{title,text,icon}],
 * ctaLabel/ctaHref, image + imageAlt (ảnh lớn), image2 + image2Alt (ảnh blob),
 * badge (nhãn trên ảnh blob, dùng | để xuống dòng).
 */
export function IconCardList({ section, index = 0 }: SectionProps) {
  const id = anchorId(section, "icon-card-list");
  const rows = items(section, "items").filter((row) => row.title || row.label);

  if (layoutOf(section, LAYOUTS, "list") === "split") {
    const image = str(section, "image");
    const image2 = str(section, "image2");
    const badge = str(section, "badge");
    return (
      <section className={SECTION} id={id}>
        <div className="site-container">
          <div className="grid grid-cols-2 items-start gap-[clamp(3rem,6vw,5.5rem)] max-[900px]:grid-cols-1">
            <div className="reveal self-stretch">
              {section?.subheading ? (
                <Eyebrow>{section.subheading}</Eyebrow>
              ) : null}
              {section?.heading ? (
                <h2 className="text-h2">{section.heading}</h2>
              ) : null}
              <RichIntro html={section?.content} />
              <Cta
                label={str(section, "ctaLabel")}
                href={str(section, "ctaHref")}
                className="btn btn-ghost-dark btn-sm"
                style={{ marginTop: "1.2rem" }}
              />
              {image ? (
                // ::after = mảng vàng lệch phía sau ảnh (isolate + -z-1 để nằm dưới ảnh
                // mà không chui xuống dưới nền section).
                <figure className='relative isolate m-0 mt-[clamp(2.5rem,5vw,4rem)] w-full max-w-[520px] pr-3 pb-3 after:absolute after:right-0 after:bottom-0 after:-z-1 after:h-[72%] after:w-[72%] after:rounded-[0.5rem_0.5rem_2rem_0.5rem] after:bg-gold-400 after:opacity-[0.72] after:content-[""] max-[900px]:mt-8'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImage(image)}
                    alt={str(section, "imageAlt") ?? ""}
                    loading="lazy"
                    className="aspect-[5/4] w-full rounded-[2rem_0.5rem_2rem_0.5rem] border border-line object-cover object-[center_62%] shadow-lift"
                  />
                </figure>
              ) : null}
            </div>

            <div className="reveal flex flex-col gap-7">
              {image2 ? (
                <figure className="relative m-0 mx-auto w-full max-w-[520px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImage(image2)}
                    alt={str(section, "image2Alt") ?? ""}
                    loading="lazy"
                    className={`aspect-[5/4] w-full object-cover shadow-lift ${BLOB_RADIUS}`}
                  />
                  {badge ? (
                    <span
                      className="absolute -bottom-[10px] -left-[12px] grid h-[94px] w-[94px] [rotate:-6deg] place-items-center rounded-full border-4 border-cream bg-gold-400 text-center text-sm leading-snug font-bold tracking-xs text-navy-900 shadow-badge"
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
              {rows.length > 0 ? (
                <ul className="flex flex-col">
                  {rows.map((row, i) => (
                    <li
                      key={`${row.title ?? row.label}-${i}`}
                      className="flex items-center gap-4 border-b border-line-soft px-1 py-4 last:border-b-0"
                    >
                      <IconBadge>{iconFor(row.icon, i)}</IconBadge>
                      <div>
                        <h4 className="m-0 text-lg">
                          {row.title ?? row.label}
                        </h4>
                        {row.text ? (
                          <p className="mt-1 mb-0 text-base text-ink-soft">
                            {row.text}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <Shell tint={index % 2 === 1} id={id}>
      <Head section={section} />
      {rows.length > 0 ? (
        <ul
          data-stagger="70"
          className="reveal reveal-group flex flex-col gap-4"
        >
          {rows.map((row, i) => (
            <li
              key={`${row.title ?? row.label}-${i}`}
              className="group flex items-center gap-5 rounded-lg border border-line bg-paper px-6 py-5 shadow-soft hover:translate-x-[6px] hover:border-gold-400"
            >
              <IconBadge className="group-hover:scale-110 group-hover:rotate-[-5deg]">
                {iconFor(row.icon, i)}
              </IconBadge>
              <div>
                <h4 className="mb-1 text-xl">{row.title ?? row.label}</h4>
                {row.text ? (
                  <p className="m-0 text-base text-ink-soft">{row.text}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Shell>
  );
}

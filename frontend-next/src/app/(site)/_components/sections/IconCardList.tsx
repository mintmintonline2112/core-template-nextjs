import { Fragment } from "react";
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
      <section className="section" id={id}>
        <div className="container">
          <div className="split orders-layout">
            <div className="split-copy orders-copy reveal">
              {section?.subheading ? <p className="eyebrow">{section.subheading}</p> : null}
              {section?.heading ? <h2>{section.heading}</h2> : null}
              <RichIntro html={section?.content} />
              <Cta
                label={str(section, "ctaLabel")}
                href={str(section, "ctaHref")}
                className="btn btn-ghost-dark btn-sm"
                style={{ marginTop: "1.2rem" }}
              />
              {image ? (
                <figure className="orders-warehouse-figure">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImage(image)} alt={str(section, "imageAlt") ?? ""} loading="lazy" />
                </figure>
              ) : null}
            </div>

            <div className="orders-side reveal">
              {image2 ? (
                <figure className="blob-figure">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImage(image2)} alt={str(section, "image2Alt") ?? ""} loading="lazy" />
                  {badge ? (
                    <span className="blob-badge" aria-hidden="true">
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
                <ul className="config-rows">
                  {rows.map((row, i) => (
                    <li key={`${row.title ?? row.label}-${i}`}>
                      <IconBadge>{iconFor(row.icon, i)}</IconBadge>
                      <div>
                        <h4>{row.title ?? row.label}</h4>
                        {row.text ? <p>{row.text}</p> : null}
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
        <ul className="config-list reveal">
          {rows.map((row, i) => (
            <li key={`${row.title ?? row.label}-${i}`}>
              <IconBadge>{iconFor(row.icon, i)}</IconBadge>
              <div>
                <h4>{row.title ?? row.label}</h4>
                {row.text ? <p>{row.text}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Shell>
  );
}

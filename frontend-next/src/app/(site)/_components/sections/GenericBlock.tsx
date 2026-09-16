import { mediaUrl } from "@/app/(site)/_lib/cms";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { Shell, anchorId, type SectionProps } from "./shared";

/**
 * Khối generic (không dùng component): eyebrow + heading + nội dung rich-text + ảnh minh họa.
 *
 * KHÔNG có gì để chuyển sang Tailwind: mọi class ở đây đều là hạ tầng dùng
 * chung với component/trang khác, chưa tới lượt chuyển —
 * `.section-head` + `.eyebrow` (helper Head trong shared.tsx và nhiều section),
 * `.photo-frame` + `.section-photo` (7 và 4 nơi dùng), `.post-content` (trang
 * tin dùng chung). Chuyển bất kỳ cái nào ở đây là phải sửa luôn những nơi kia,
 * nên để nguyên cho đợt chuyển hạ tầng.
 */
export function GenericBlock({ section, index = 0 }: SectionProps) {
  if (!section) return null;
  const image = mediaUrl(section.mediaPath);
  return (
    <Shell tint={index % 2 === 1} id={anchorId(section, "generic")}>
      {section.subheading || section.heading ? (
        <div className="section-head reveal">
          {section.subheading ? (
            <p className="eyebrow">{section.subheading}</p>
          ) : null}
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
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(section.content),
          }}
        />
      ) : null}
    </Shell>
  );
}

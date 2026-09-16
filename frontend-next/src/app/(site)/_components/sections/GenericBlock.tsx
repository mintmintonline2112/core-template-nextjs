import { mediaUrl } from "@/app/(site)/_lib/cms";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { Shell, anchorId, type SectionProps } from "./shared";

/** Khối generic (không dùng component): eyebrow + heading + nội dung rich-text + ảnh minh họa. */
export function GenericBlock({ section, index = 0 }: SectionProps) {
  if (!section) return null;
  const image = mediaUrl(section.mediaPath);
  return (
    <Shell tint={index % 2 === 1} id={anchorId(section, "generic")}>
      {section.subheading || section.heading ? (
        <div className="section-head reveal">
          {section.subheading ? <p className="eyebrow">{section.subheading}</p> : null}
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
        <div className="post-content reveal" dangerouslySetInnerHTML={{ __html: sanitizeRichText(section.content) }} />
      ) : null}
    </Shell>
  );
}

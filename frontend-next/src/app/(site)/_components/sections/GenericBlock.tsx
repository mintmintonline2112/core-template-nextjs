import { ARCH, PHOTO_FRAME, SECTION_PHOTO } from "@/app/(site)/_components/ui";
import { mediaUrl } from "@/app/(site)/_lib/cms";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { cn } from "@/utils/cn";
import { Head, Shell, anchorId, type SectionProps } from "./shared";

/**
 * Khối generic (không dùng component): eyebrow + heading + ảnh minh họa + nội
 * dung rich-text. Nội dung là HTML từ CMS nên dùng class `.post-content`
 * (styles/components.css) chứ không đặt được class Tailwind vào từng thẻ.
 */
export function GenericBlock({ section, index = 0 }: SectionProps) {
  if (!section) return null;
  const image = mediaUrl(section.mediaPath);
  return (
    <Shell tint={index % 2 === 1} id={anchorId(section, "generic")}>
      <Head section={section} intro={false} />
      {image ? (
        <figure className={cn(PHOTO_FRAME, SECTION_PHOTO, ARCH, "reveal")}>
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

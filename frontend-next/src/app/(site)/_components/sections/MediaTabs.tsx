import {
  MediaTabPanels,
  type MediaTab,
} from "@/app/(site)/_components/MediaTabPanels";
import { SECTION } from "@/app/(site)/_components/ui";
import {
  Head,
  anchorId,
  items,
  paragraphs,
  resolveImage,
  str,
  type SectionProps,
} from "./shared";

const pad = (n: number) => String(n + 1).padStart(2, "0");

/**
 * SECTION `media-tabs` — nội dung chia tab (VD mỗi tab một giống hạnh nhân):
 * hàng tab gạch chân, dưới là ảnh trái + tiêu đề lớn viết hoa, đoạn dẫn đậm,
 * mô tả, nút "Explore more" (MediaTabPanels.tsx). Có heading thì hiện đầu khối.
 * CMS: subheading, heading, content, metadata.items [{title,heading,short,text,
 * image,imagePosition,ctaLabel,ctaHref}], itemLabel (chữ nhỏ trước số thứ tự,
 * trống thì ẩn), ctaLabel/ctaHref (nút mặc định khi tab không tự đặt).
 */
export function MediaTabs({ section }: SectionProps) {
  const itemLabel = str(section, "itemLabel");
  const defaultCtaLabel = str(section, "ctaLabel");
  const defaultCtaHref = str(section, "ctaHref");

  const tabs: MediaTab[] = items(section, "items")
    .filter((item) => item.title)
    .map((item, i) => ({
      title: item.title,
      heading: item.heading || item.title,
      label: itemLabel ? `${itemLabel} ${pad(i)}` : undefined,
      short: item.short || undefined,
      paragraphs: item.text ? paragraphs(item.text) : [],
      image: item.image ? resolveImage(item.image) : undefined,
      imagePosition: item.imagePosition || undefined,
      ctaLabel: item.ctaLabel || defaultCtaLabel,
      ctaHref: item.ctaHref || defaultCtaHref,
    }));

  return (
    <section className={SECTION} id={anchorId(section, "media-tabs")}>
      <div className="site-container">
        <Head section={section} />
        {tabs.length > 0 ? <MediaTabPanels tabs={tabs} /> : null}
      </div>
    </section>
  );
}

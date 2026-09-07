import { GenericBlock, SECTION_COMPONENTS } from "@/components/site/sections";
import type { PageSection } from "@/types/cms";

/**
 * Render một page-section như một COMPONENT tái sử dụng trên trang CMS tự do.
 * Loại component đọc từ metadata._component (form admin tự gắn khi chọn),
 * fallback theo sectionKey — nên section của 4 trang chuẩn cũng nhận diện được.
 * Không khớp registry → khối generic (eyebrow + heading + nội dung + ảnh).
 *
 * Registry + từng component nằm ở components/site/sections/.
 */
export function componentType(section: PageSection): string {
  const meta = (section.metadata ?? {}) as Record<string, unknown>;
  return typeof meta._component === "string" && meta._component
    ? meta._component
    : section.sectionKey;
}

export function SectionRenderer({ section, index }: { section: PageSection; index: number }) {
  const Component = SECTION_COMPONENTS[componentType(section)];
  if (!Component) return <GenericBlock section={section} index={index} />;
  return <Component section={section} index={index} />;
}

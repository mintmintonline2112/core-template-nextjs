import type { ComponentType } from "react";
import { GenericBlock, SECTION_COMPONENTS } from "@/app/(site)/_components/sections";
import type { StandardSectionProps } from "@/app/(site)/_components/sections/section-content";
import type { CmsPage, PageSection } from "@/types/cms";

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

/**
 * Danh sách section của một trang chuẩn (Home / Products / Contact).
 * - CMS có trang → hiển thị đúng các section đang bật, theo thứ tự admin
 *   (xoá hoặc tắt section = khối biến mất).
 * - API lỗi / chưa có trang → bộ khối mặc định `defaults` (tự dùng nội dung viết sẵn).
 */
export function PageSections({
  page,
  defaults,
}: {
  page: CmsPage | null;
  defaults: Array<ComponentType<StandardSectionProps>>;
}) {
  if (!page) {
    return (
      <>
        {defaults.map((Component, index) => (
          <Component key={index} index={index} />
        ))}
      </>
    );
  }

  const sections = (page.sections ?? [])
    .filter((section) => section.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {sections.map((section, index) => (
        <SectionRenderer key={section.id} section={section} index={index} />
      ))}
    </>
  );
}

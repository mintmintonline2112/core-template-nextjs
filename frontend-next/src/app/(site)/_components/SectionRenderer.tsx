import { GenericBlock, SECTION_COMPONENTS, resolveComponent } from "@/app/(site)/_components/sections";
import type { CmsPage, PageSection } from "@/types/cms";

/**
 * Render một page-section bằng component trong registry.
 * Loại component đọc từ metadata._component (form admin tự gắn khi chọn), fallback
 * theo sectionKey (section cũ chưa có `_component`). Tên cũ trước khi gộp theo bố
 * cục vẫn nhận diện được (LEGACY_COMPONENTS) và tự gắn layout tương ứng.
 * Không khớp registry → khối generic (eyebrow + heading + nội dung + ảnh).
 */
export function componentType(section: PageSection): string {
  const meta = (section.metadata ?? {}) as Record<string, unknown>;
  return typeof meta._component === "string" && meta._component ? meta._component : section.sectionKey;
}

export function SectionRenderer({ section, index }: { section: PageSection; index: number }) {
  const resolved = resolveComponent(componentType(section));
  const Component = resolved ? SECTION_COMPONENTS[resolved.component] : undefined;
  if (!resolved || !Component) return <GenericBlock section={section} index={index} />;

  // Tên cũ → gắn layout + đổi tên key dữ liệu cũ (chỉ khi section chưa có).
  const meta = { ...((section.metadata ?? {}) as Record<string, unknown>) };
  let changed = false;
  if (resolved.layout && typeof meta.layout !== "string") {
    meta.layout = resolved.layout;
    changed = true;
  }
  for (const [from, to] of Object.entries(resolved.keys ?? {})) {
    if (meta[to] === undefined && meta[from] !== undefined) {
      meta[to] = meta[from];
      changed = true;
    }
  }

  return <Component section={changed ? { ...section, metadata: meta } : section} index={index} />;
}

/**
 * Danh sách section của một trang: đúng các section đang bật, theo thứ tự admin
 * (xoá hoặc tắt section = khối biến mất). Trang lấy từ CMS; API lỗi thì trang
 * gọi với bản dự phòng (src/content/cms-fallback.json).
 */
export function PageSections({ page }: { page: CmsPage }) {
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

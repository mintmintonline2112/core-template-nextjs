import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import type { PageSection } from "@/types/cms";

/**
 * Đồ dùng chung cho SECTION CỦA TRANG CHUẨN (Home / Products / Contact).
 *
 * QUY TẮC TÊN: section key (kebab-case) = tên file component (PascalCase) = id neo
 * trên trang — VD `product-specs` ↔ ProductSpecs.tsx ↔ /#product-specs.
 *
 * Mỗi section nhận `section` từ CMS (có thể thiếu hoặc đang tắt) và tự có nội
 * dung mặc định, nên trang vẫn đầy đủ khi CMS trống.
 */
export type StandardSectionProps = { section?: PageSection | null; index?: number };

/** metadata[key] của section, `undefined` khi thiếu. */
export function metaOf<T>(section: PageSection | null | undefined, key: string): T | undefined {
  const value = section?.metadata?.[key];
  return value === undefined || value === null ? undefined : (value as T);
}

/** Đoạn intro rich-text (đã sanitize); rỗng thì không render. */
export function RichIntro({
  html,
  className = "section-intro",
}: {
  html: string | null | undefined;
  className?: string;
}) {
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }} />;
}

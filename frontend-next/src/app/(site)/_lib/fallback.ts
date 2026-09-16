import fallbackJson from "@/content/cms-fallback.json";
import type { CmsPage } from "@/types/cms";

/**
 * Bản DỰ PHÒNG của các trang chuẩn — dùng khi API CMS lỗi hoặc trang bị gỡ khỏi
 * CMS, để website không trống. Sinh từ seed backend (nguồn nội dung duy nhất):
 *   cd backend && npm run content:export
 * Không sửa tay file JSON; sửa page.seed.ts rồi chạy lại lệnh trên.
 */
const FALLBACK = fallbackJson as unknown as Record<string, CmsPage>;

export function fallbackPage(slug: "home" | "products" | "contact"): CmsPage {
  return FALLBACK[slug];
}

import { apiFetch } from "@/lib/api";
import { SITE_MENU_ITEMS, type SiteMenuItem } from "@/config/site-menu";

/**
 * Menu public lấy từ CMS (bảng menu_items, quản lý tại /admin/menus).
 * Lỗi API hoặc menu rỗng → fallback về config tĩnh SITE_MENU_ITEMS.
 */

type ApiMenuItem = {
  id: number;
  label: string;
  href: string;
  showSubmenu?: boolean;
  children?: { id: number; label: string; href: string }[];
};

export async function getSiteMenu(): Promise<SiteMenuItem[]> {
  try {
    const items = await apiFetch<ApiMenuItem[]>("client/menu", {
      next: { revalidate: 60, tags: ["menu"] },
    });
    if (!items?.length) return SITE_MENU_ITEMS;

    return items.map((item) => ({
      key: String(item.id),
      label: item.label,
      href: item.href,
      showSubmenu: item.showSubmenu !== false,
      children: item.children?.length
        ? item.children.map((child) => ({
            label: child.label,
            href: child.href,
          }))
        : undefined,
    }));
  } catch {
    return SITE_MENU_ITEMS;
  }
}

import { siteRoutes } from "@/config/routes";
/** Fallback menu tĩnh — dùng khi API menu lỗi hoặc CMS chưa có dữ liệu. */

export type SiteMenuChild = {
  label: string;
  href: string;
};

export type SiteMenuItem = {
  key: string;
  label: string;
  href: string;
  showSubmenu?: boolean;
  children?: SiteMenuChild[];
};

/** Khớp menu khởi tạo trong backend `menu.seed.ts` — đổi seed thì sửa cả ở đây. */
export const SITE_MENU_ITEMS: SiteMenuItem[] = [
  { key: "home", label: "Trang chủ", href: siteRoutes.home },
  {
    key: "products",
    label: "Dịch vụ",
    href: siteRoutes.products,
    children: [
      { label: "Các gói dịch vụ", href: siteRoutes.productsSection('dich-vu-noi-bat') },
      { label: "Cam kết", href: siteRoutes.productsSection('cam-ket') },
    ],
  },
  { key: "gioi-thieu", label: "Giới thiệu", href: siteRoutes.homeSection('gioi-thieu') },
  { key: "quy-trinh", label: "Quy trình", href: siteRoutes.homeSection('quy-trinh') },
  { key: "news", label: "Tin tức", href: siteRoutes.news },
  { key: "contact", label: "Liên hệ", href: siteRoutes.contact },
];

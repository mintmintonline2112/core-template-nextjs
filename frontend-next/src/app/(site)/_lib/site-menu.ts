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

export const SITE_MENU_ITEMS: SiteMenuItem[] = [
  { key: "home", label: "Home", href: siteRoutes.home },
  {
    key: "products",
    label: "Products",
    href: siteRoutes.products,
    children: [
      { label: "Natural Almonds", href: siteRoutes.productsSection('natural') },
      { label: "Processed Almonds", href: siteRoutes.productsSection('processed') },
      { label: "Kernel Sizes", href: siteRoutes.productsSection('sizes') },
    ],
  },
  { key: "markets", label: "Markets", href: siteRoutes.homeSection('markets') },
  { key: "sourcing", label: "Sourcing", href: siteRoutes.homeSection('sourcing') },
  {
    key: "news",
    label: "News",
    href: siteRoutes.news,
    children: [
      { label: "Market Update", href: siteRoutes.newsCategory('market-update') },
      { label: "Company News", href: siteRoutes.newsCategory('company-news') },
      { label: "Industry Insight", href: siteRoutes.newsCategory('industry-insight') },
      { label: "Logistics", href: siteRoutes.newsCategory('logistics') },
    ],
  },
  { key: "contact", label: "Contact", href: siteRoutes.contact },
];

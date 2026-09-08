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
  { key: "home", label: "Home", href: "/" },
  {
    key: "products",
    label: "Products",
    href: "/products",
    children: [
      { label: "Natural Almonds", href: "/products#natural" },
      { label: "Processed Almonds", href: "/products#processed" },
      { label: "Kernel Sizes", href: "/products#sizes" },
    ],
  },
  { key: "markets", label: "Markets", href: "/#markets" },
  { key: "sourcing", label: "Sourcing", href: "/#sourcing" },
  {
    key: "news",
    label: "News",
    href: "/news",
    children: [
      { label: "Market Update", href: "/news?category=market-update" },
      { label: "Company News", href: "/news?category=company-news" },
      { label: "Industry Insight", href: "/news?category=industry-insight" },
      { label: "Logistics", href: "/news?category=logistics" },
    ],
  },
  { key: "contact", label: "Contact", href: "/contact" },
];

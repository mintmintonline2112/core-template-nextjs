import type { ReactNode, SVGProps } from 'react';

export type AdminIconName =
  | 'dashboard'
  | 'article'
  | 'category'
  | 'page'
  | 'section'
  | 'contact'
  | 'contactPage'
  | 'staff'
  | 'role'
  | 'permission'
  | 'menu'
  | 'image'
  | 'settings'
  | 'logout'
  | 'external'
  | 'chevron'
  | 'search'
  | 'refresh';

const paths: Record<AdminIconName, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  article: <><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5M9 12h6M9 16h6"/></>,
  category: <><path d="M3 6h7l2 3h9v10H3z"/><path d="M3 6V4h7l2 2"/></>,
  page: <><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h4"/></>,
  section: <><rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="8" height="6" rx="1"/><rect x="15" y="14" width="6" height="6" rx="1"/></>,
  contact: <><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></>,
  contactPage: <><path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/></>,
  staff: <><circle cx="9" cy="8" r="4"/><path d="M2.5 21a6.5 6.5 0 0 1 13 0M17 11v6M14 14h6"/></>,
  role: <><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></>,
  permission: <><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8 2 2-2 2 1 1-2 2-1-1-4 4"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m3 18 5-5 3 3 4-4 6 6"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M4.9 19.1l2.2-2.2M16.9 7.1l2.2-2.2"/></>,
  logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M9 12h9"/></>,
  external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v7H4V6h7"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/></>,
};

export function AdminIcon({
  name,
  ...props
}: { name: AdminIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

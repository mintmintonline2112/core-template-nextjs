import type { AdminIconName } from '@/app/admin/_components/AdminIcon';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: AdminIconName;
  permission?: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const adminNavigation: AdminNavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      {
        label: 'Bài viết',
        href: '/admin/blog-posts',
        icon: 'article',
        permission: 'BLOG_POST_LIST',
      },
      {
        label: 'Danh mục blog',
        href: '/admin/blog-categories',
        icon: 'category',
        permission: 'BLOG_CATEGORY_LIST',
      },
      {
        label: 'Trang',
        href: '/admin/pages',
        icon: 'page',
        permission: 'PAGE_LIST',
      },
      {
        label: 'Page section',
        href: '/admin/page-sections',
        icon: 'section',
        permission: 'PAGE_SECTION_LIST',
      },
      {
        label: 'Menu website',
        href: '/admin/menus',
        icon: 'menu',
        permission: 'MENU_ITEM_LIST',
      },
      {
        label: 'Thư viện ảnh & video',
        href: '/admin/library',
        icon: 'image',
        permission: 'LIBRARY_LIST',
      },
    ],
  },
  {
    label: 'Khách hàng',
    items: [
      {
        label: 'Liên hệ',
        href: '/admin/contacts',
        icon: 'contact',
        permission: 'CONTACT_LIST',
      },
      {
        label: 'Trang Liên hệ',
        href: '/admin/contact-page',
        icon: 'contactPage',
        permission: 'SETTING_LIST',
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        label: 'Nhân sự',
        href: '/admin/staffs',
        icon: 'staff',
        permission: 'STAFF_LIST',
      },
      {
        label: 'Vai trò',
        href: '/admin/roles',
        icon: 'role',
        permission: 'ROLE_LIST',
      },
      {
        label: 'Phân quyền',
        href: '/admin/permissions',
        icon: 'permission',
        permission: 'PERMISSION_LIST',
      },
      {
        label: 'Cài đặt',
        href: '/admin/settings',
        icon: 'settings',
        permission: 'SETTING_LIST',
      },
    ],
  },
];

export function getAdminPageTitle(pathname: string): string {
  const item = adminNavigation
    .flatMap((group) => group.items)
    .find((entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`));
  return item?.label ?? 'Quản trị nội dung';
}

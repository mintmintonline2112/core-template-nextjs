import type { AdminIconName } from '@/app/admin/_components/AdminIcon';
import { adminRoutes } from '@/config/routes';
import { isActivePath } from '@/utils/route';

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
      { label: 'Dashboard', href: adminRoutes.dashboard, icon: 'dashboard' },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      {
        label: 'Bài viết',
        href: adminRoutes.blogPosts.list,
        icon: 'article',
        permission: 'BLOG_POST_LIST',
      },
      {
        label: 'Danh mục blog',
        href: adminRoutes.blogCategories.list,
        icon: 'category',
        permission: 'BLOG_CATEGORY_LIST',
      },
      {
        label: 'Trang',
        href: adminRoutes.pages.list,
        icon: 'page',
        permission: 'PAGE_LIST',
      },
      {
        label: 'Page section',
        href: adminRoutes.pageSections.list,
        icon: 'section',
        permission: 'PAGE_SECTION_LIST',
      },
      {
        label: 'Menu website',
        href: adminRoutes.menus.list,
        icon: 'menu',
        permission: 'MENU_ITEM_LIST',
      },
      {
        label: 'Thư viện ảnh & video',
        href: adminRoutes.library,
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
        href: adminRoutes.contacts,
        icon: 'contact',
        permission: 'CONTACT_LIST',
      },
      {
        label: 'Trang Liên hệ',
        href: adminRoutes.contactPage,
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
        href: adminRoutes.staffs.list,
        icon: 'staff',
        permission: 'STAFF_LIST',
      },
      {
        label: 'Vai trò',
        href: adminRoutes.roles.list,
        icon: 'role',
        permission: 'ROLE_LIST',
      },
      {
        label: 'Phân quyền',
        href: adminRoutes.permissions,
        icon: 'permission',
        permission: 'PERMISSION_LIST',
      },
      {
        label: 'Cài đặt',
        href: adminRoutes.settings,
        icon: 'settings',
        permission: 'SETTING_LIST',
      },
    ],
  },
];

export function getAdminPageTitle(pathname: string): string {
  const item = adminNavigation
    .flatMap((group) => group.items)
    .find((entry) => isActivePath(pathname, entry.href));
  return item?.label ?? 'Quản trị nội dung';
}

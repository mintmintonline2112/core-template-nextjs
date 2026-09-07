import { createCrudService } from '@/admin/core/crud-service';

export const MENU_ITEM_QUERY_KEY = ['admin', 'menu-items'] as const;

export interface MenuItem {
  id: number;
  label: string;
  href: string;
  parentId: number | null;
  description: string | null;
  isActive: boolean;
  showSubmenu: boolean;
  sortOrder: number;
  translations?: Record<string, Record<string, unknown>> | null;
  createdAt: string;
}

export const menuItemService = createCrudService<MenuItem>('admin/menu-items', [
  { parentId: 'ASC' },
  { sortOrder: 'ASC' },
]);

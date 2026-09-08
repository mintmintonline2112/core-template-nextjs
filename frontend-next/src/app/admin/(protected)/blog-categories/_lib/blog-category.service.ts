import { createCrudService } from '@/app/admin/_lib/crud-service';

export const BLOG_CATEGORY_QUERY_KEY = ['admin', 'blog-categories'] as const;

export interface BlogCategory {
  id: number;
  name: string;
  /** Tên hiện ngoài website — null thì dùng name. */
  displayName: string | null;
  slug: string;
  parentId: number | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImagePath: string | null;
  canonicalUrl: string | null;
  translations?: Record<string, Record<string, unknown>> | null;
  createdAt: string;
}

export const blogCategoryService = createCrudService<BlogCategory>('admin/blog-categories', [
  { sortOrder: 'ASC' },
  { id: 'DESC' },
]);

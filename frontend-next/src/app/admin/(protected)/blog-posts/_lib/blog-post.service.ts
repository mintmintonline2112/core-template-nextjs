import { createCrudService } from '@/app/admin/_lib/crud-service';
import type { PublishStatus } from '@/app/admin/_lib/cms-shared';

export const BLOG_POST_QUERY_KEY = ['admin', 'blog-posts'] as const;

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  status: PublishStatus;
  categoryId: number | null;
  authorStaffId: string | null;
  excerpt: string | null;
  content: string;
  coverImagePath: string | null;
  videoPath: string | null;
  videoOrientation: 'landscape' | 'portrait' | null;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImagePath: string | null;
  canonicalUrl: string | null;
  metadata: Record<string, unknown> | null;
  translations?: Record<string, Record<string, unknown>> | null;
  createdAt: string;
}

export const blogPostService = createCrudService<BlogPost>('admin/blog-posts', [
  { createdAt: 'DESC' },
]);

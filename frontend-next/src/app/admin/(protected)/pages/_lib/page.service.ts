import { createCrudService } from '@/app/admin/_lib/crud-service';
import type { PublishStatus } from '@/app/admin/_lib/cms-shared';

export const PAGE_QUERY_KEY = ['admin', 'pages'] as const;

export interface PageSectionSummary {
  id: number;
  sectionKey: string;
  heading: string | null;
  isActive: boolean;
  sortOrder: number;
  /** metadata._component = component thật (key instance có thể khác, VD hero-slider-2). */
  metadata?: Record<string, unknown> | null;
}

export interface SitePage {
  id: number;
  title: string;
  slug: string;
  status: PublishStatus;
  eyebrow: string | null;
  lead: string | null;
  templateKey: string | null;
  sortOrder: number;
  sections?: PageSectionSummary[];
  metaTitle: string | null;
  metaDescription: string | null;
  ogImagePath: string | null;
  canonicalUrl: string | null;
  translations?: Record<string, Record<string, unknown>> | null;
  createdAt: string;
}

export const pageService = createCrudService<SitePage>('admin/pages', [
  { sortOrder: 'ASC' },
  { id: 'ASC' },
]);

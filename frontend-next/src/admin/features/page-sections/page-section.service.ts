import { adminApi } from '@/admin/core/admin-api';
import { createCrudService } from '@/admin/core/crud-service';

export const PAGE_SECTION_QUERY_KEY = ['admin', 'page-sections'] as const;
export const SECTION_DEFINITION_QUERY_KEY = ['admin', 'section-definitions'] as const;

/** Spec một field metadata — khớp SectionFieldSpec phía backend. */
export type SectionFieldSpec =
  | { key: string; label: string; type: 'stringList'; hint?: string }
  | {
      key: string;
      label: string;
      type: 'itemList';
      hint?: string;
      itemFields: Array<{ name: string; label: string; kind: 'text' | 'textarea' | 'image' }>;
    }
  | {
      key: string;
      label: string;
      type: 'textMap';
      hint?: string;
      fields: Array<{ name: string; label: string }>;
    }
  | { key: string; label: string; type: 'json'; hint?: string };

export interface SectionDefinition {
  id: number;
  pageSlug: string;
  sectionKey: string;
  label: string;
  description: string | null;
  fields: SectionFieldSpec[];
  sortOrder: number;
}

/** Danh mục loại section (bảng section_definitions, seed đồng bộ theo code). */
export function fetchSectionDefinitions(): Promise<SectionDefinition[]> {
  return adminApi.get<SectionDefinition[]>('admin/section-definitions');
}

export interface PageSection {
  id: number;
  pageId: number;
  sectionKey: string;
  heading: string | null;
  subheading: string | null;
  content: string | null;
  mediaPath: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  sortOrder: number;
  translations?: Record<string, Record<string, unknown>> | null;
  createdAt: string;
}

export const pageSectionService = createCrudService<PageSection>('admin/page-sections', [
  { pageId: 'ASC' },
  { sortOrder: 'ASC' },
]);

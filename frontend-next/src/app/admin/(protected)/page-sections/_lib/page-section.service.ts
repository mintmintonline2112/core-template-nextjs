import { adminApi } from '@/app/admin/_lib/admin-api';
import { createCrudService } from '@/app/admin/_lib/crud-service';

export const PAGE_SECTION_QUERY_KEY = ['admin', 'page-sections'] as const;
export const SECTION_DEFINITION_QUERY_KEY = ['admin', 'section-definitions'] as const;

/** Phần chung của mọi field spec. */
type SpecBase = {
  key: string;
  label: string;
  hint?: string;
  /** Chỉ hiện khi metadata.layout thuộc danh sách này. */
  layouts?: string[];
};

/** Spec một field metadata — khớp SectionFieldSpec phía backend. */
export type SectionFieldSpec = SpecBase &
  (
    | { type: 'stringList' }
    | {
        type: 'itemList';
        itemFields: Array<{ name: string; label: string; kind: 'text' | 'textarea' | 'image' }>;
      }
    | { type: 'textMap'; fields: Array<{ name: string; label: string }> }
    /** positionKey: key metadata lưu vị trí ảnh (object-position) — hiện công cụ chọn điểm lấy nét. */
    | { type: 'image'; positionKey?: string }
    | { type: 'json' }
    | { type: 'select'; options: Array<{ value: string; label: string; hint?: string }> }
  );

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

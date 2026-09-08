import type { TableStatusConfig } from '@/app/admin/_components/data-table/types';
import type { GenericSelectOption } from '@/app/admin/_components/generic-form/types';

export type PublishStatus = 'draft' | 'published' | 'archived';

export const PUBLISH_STATUS_OPTIONS: GenericSelectOption[] = [
  { label: 'Bản nháp', value: 'draft' },
  { label: 'Đã xuất bản', value: 'published' },
  { label: 'Lưu trữ', value: 'archived' },
];

export const PUBLISH_STATUS_CONFIG: TableStatusConfig[] = [
  { value: 'published', label: 'Đã xuất bản', className: 'is-success' },
  { value: 'draft', label: 'Bản nháp', className: 'is-muted' },
  { value: 'archived', label: 'Lưu trữ', className: 'is-warning' },
];

export const ACTIVE_STATUS_CONFIG: TableStatusConfig[] = [
  { value: true, label: 'Hiển thị', className: 'is-success' },
  { value: false, label: 'Ẩn', className: 'is-muted' },
];

export function toDateInput(iso?: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

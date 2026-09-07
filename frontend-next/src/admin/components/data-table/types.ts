import type { PaginatedResponse } from '@/admin/core/pagination';

export type TableColumnType =
  | 'text'
  | 'badge'
  | 'image'
  | 'status'
  | 'sort'
  | 'action'
  | 'custom';

export type TableAction =
  | 'edit'
  | 'delete'
  | 'add'
  | 'block'
  | 'sort'
  | 'accept'
  | 'cancel'
  | 'reply'
  | 'toggle';

export interface TableStatusConfig {
  value: string | number | boolean;
  label: string;
  className?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  type: TableColumnType;
  align?: 'left' | 'center' | 'right';
  value?: (row: T) => unknown;
  link?: (row: T) => string | null | undefined;
  actionGuard?: (row: T) => boolean;
  render?: (row: T) => React.ReactNode;
  statusConfig?: TableStatusConfig[];
  sortKey?: string;
  minSort?: number;
  actionConfig?: {
    accept?: { disabled?: (row: T) => boolean };
    cancel?: { disabled?: (row: T) => boolean };
  };
}

export interface TableFilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

export interface TableActionEvent<T> {
  action: TableAction;
  item?: T;
  value?: number;
}

export type TableFetcher<T> = (
  params: { page: number; limit: number; search?: string } & Record<string, unknown>,
) => Promise<PaginatedResponse<T>>;

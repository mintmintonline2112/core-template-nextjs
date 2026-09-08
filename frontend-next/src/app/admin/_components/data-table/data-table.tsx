'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  Download,
  Check,
  Ban,
  ShieldOff,
  MessageSquareReply,
  CircleCheck,
} from 'lucide-react';
import { cn, getErrorMessage, resolveImageUrl } from '@/app/admin/_lib/utils';
import { Pagination } from './pagination';
import type {
  TableAction,
  TableActionEvent,
  TableColumn,
  TableFetcher,
  TableFilterOption,
} from './types';

function errorLabel(error: unknown): string {
  const status = (error as { status?: number })?.status;
  if (status === 403) {
    return 'tài khoản chưa có quyền xem mục này. Hãy đăng xuất rồi đăng nhập lại để cập nhật quyền mới.';
  }
  return getErrorMessage(error);
}

interface DataTableProps<T extends object> {
  columns: TableColumn<T>[];
  fetcher: TableFetcher<T>;
  queryKey: unknown[];
  title?: string;
  subtitle?: string;
  rowKey?: string;
  limit?: number;
  showAdd?: boolean;
  addLabel?: string;
  searchPlaceholder?: string;
  statusOptions?: string[];
  filters?: TableFilterOption[];
  enabledActions?: TableAction[];
  query?: Record<string, unknown>;
  onAction?: (event: TableActionEvent<T>) => void;
  showExport?: boolean;
  onExport?: () => void;
  headerActions?: React.ReactNode;
}

export function DataTable<T extends object>({
  columns,
  fetcher,
  queryKey,
  title,
  subtitle,
  rowKey = 'id',
  limit: initialLimit = 20,
  showAdd = true,
  addLabel = 'Thêm mới',
  searchPlaceholder = 'Tìm kiếm...',
  statusOptions = [],
  filters = [],
  enabledActions = ['edit', 'delete'],
  query = {},
  onAction,
  showExport = false,
  onExport,
  headerActions,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, status, extraFilters, limit]);

  const params = useMemo(
    () => ({ page, limit, search, status, ...query, ...extraFilters }),
    [page, limit, search, status, query, extraFilters],
  );

  const { data, isFetching, error } = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => fetcher(params),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const currentPage = meta?.page ?? page;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const total = meta?.total ?? rows.length;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const rangeEnd = Math.min(currentPage * limit, total);

  const emit = (action: TableAction, item?: T, value?: number) =>
    onAction?.({ action, item, value });

  const cellValue = (col: TableColumn<T>, row: T): unknown =>
    col.value ? col.value(row) : (row as Record<string, unknown>)[col.key as string];

  const alignClass = (a?: string) =>
    a === 'center' ? 'is-center' : a === 'right' ? 'is-right' : undefined;

  function renderCell(col: TableColumn<T>, row: T): React.ReactNode {
    switch (col.type) {
      case 'badge':
        return <span className="dt-badge">{String(cellValue(col, row) ?? '')}</span>;
      case 'image': {
        const src = resolveImageUrl(cellValue(col, row) as string | null);
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="dt-thumb" />
        ) : (
          <span className="dt-dash">—</span>
        );
      }
      case 'status': {
        const raw = cellValue(col, row);
        // MySQL trả tinyint 1/0 cho cột boolean — chuẩn hóa trước khi so khớp config.
        const normalized =
          typeof raw === 'number' && (raw === 0 || raw === 1) ? raw === 1 : raw;
        const cfg = col.statusConfig?.find(
          (c) => c.value === raw || c.value === normalized,
        );
        return (
          <span className={cn('dt-status', cfg?.className)}>
            {cfg?.label ?? String(raw ?? '')}
          </span>
        );
      }
      case 'sort':
        return (
          <input
            type="number"
            min={col.minSort ?? 1}
            defaultValue={Number(cellValue(col, row) ?? 1)}
            onBlur={(e) => {
              const v = Number(e.target.value);
              if (Number.isInteger(v) && v >= 1) emit('sort', row, v);
            }}
            className="dt-sort-input"
          />
        );
      case 'custom':
        return col.render ? col.render(row) : null;
      case 'action': {
        if (col.actionGuard?.(row)) return null;
        const acceptDisabled = col.actionConfig?.accept?.disabled?.(row) ?? false;
        const cancelDisabled = col.actionConfig?.cancel?.disabled?.(row) ?? false;
        return (
          <div className="dt-actions">
            {enabledActions.includes('accept') && (
              <button
                type="button"
                disabled={acceptDisabled}
                onClick={() => emit('accept', row)}
                className="dt-action dt-action--accept"
                aria-label="Accept"
                title="Xác nhận"
              >
                <Check size={15} />
              </button>
            )}
            {enabledActions.includes('cancel') && (
              <button
                type="button"
                disabled={cancelDisabled}
                onClick={() => emit('cancel', row)}
                className="dt-action dt-action--cancel"
                aria-label="Cancel"
                title="Hủy"
              >
                <Ban size={15} />
              </button>
            )}
            {enabledActions.includes('reply') && (
              <button
                type="button"
                onClick={() => emit('reply', row)}
                className="dt-action dt-action--reply"
                aria-label="Reply"
                title="Trả lời"
              >
                <MessageSquareReply size={15} />
              </button>
            )}
            {enabledActions.includes('toggle') && (
              <button
                type="button"
                onClick={() => emit('toggle', row)}
                className="dt-action dt-action--toggle"
                aria-label="Toggle approval"
                title="Duyệt / Bỏ duyệt"
              >
                <CircleCheck size={15} />
              </button>
            )}
            {enabledActions.includes('edit') && (
              <button
                type="button"
                onClick={() => emit('edit', row)}
                className="dt-action"
                aria-label="Edit"
                title="Sửa"
              >
                <Pencil size={15} />
              </button>
            )}
            {enabledActions.includes('block') && (
              <button
                type="button"
                onClick={() => emit('block', row)}
                className="dt-action dt-action--block"
                aria-label="Block / Unblock"
                title="Khóa / Mở khóa"
              >
                <ShieldOff size={15} />
              </button>
            )}
            {enabledActions.includes('delete') && (
              <button
                type="button"
                onClick={() => emit('delete', row)}
                className="dt-action dt-action--delete"
                aria-label="Delete"
                title="Xóa"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        );
      }
      case 'text':
      default: {
        const val = cellValue(col, row);
        const href = col.link?.(row);
        const content = val == null || val === '' ? '—' : String(val);
        return href ? (
          <Link href={href} className="dt-link">
            {content}
          </Link>
        ) : (
          <span>{content}</span>
        );
      }
    }
  }

  return (
    <div>
      {(title || showAdd || showExport || headerActions) && (
        <div className="adm-page-header is-row">
          <div>
            {title && <h1 className="adm-page-title">{title}</h1>}
            {subtitle && <p className="adm-page-subtitle">{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {headerActions}
            {showExport && (
              <button type="button" onClick={onExport} className="adm-btn">
                <Download size={16} /> Xuất Excel
              </button>
            )}
            {showAdd && (
              <button type="button" onClick={() => emit('add')} className="adm-btn adm-btn--primary">
                <Plus size={16} /> {addLabel}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="dt-toolbar">
        <div className="dt-search">
          <Search size={16} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>

        {statusOptions.length > 0 && (
          <select className="dt-filter" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        {filters.map((f) => (
          <select
            key={f.key}
            className="dt-filter"
            value={extraFilters[f.key] ?? ''}
            onChange={(e) =>
              setExtraFilters((prev) => {
                const next = { ...prev };
                if (e.target.value === '') delete next[f.key];
                else next[f.key] = e.target.value;
                return next;
              })
            }
          >
            <option value="">{f.label}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="dt-card">
        <div className="dt-scroll">
          <table className="dt-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={String(col.key)} className={alignClass(col.align)}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={columns.length} className="dt-empty dt-error">
                    Không tải được dữ liệu: {errorLabel(error)}
                  </td>
                </tr>
              ) : isFetching && rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="dt-empty">
                    Đang tải…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="dt-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const key = (row as Record<string, unknown>)[rowKey] ?? idx;
                  return (
                    <tr key={String(key)}>
                      {columns.map((col) => (
                        <td key={String(col.key)} className={alignClass(col.align)}>
                          {renderCell(col, row)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          className="in-card"
          page={currentPage}
          totalPages={totalPages}
          total={total}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}

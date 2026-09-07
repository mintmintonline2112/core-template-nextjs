'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/admin/components/data-table/data-table';
import type {
  TableColumn,
  TableActionEvent,
  TableFilterOption,
} from '@/admin/components/data-table/types';
import { confirmAction } from '@/admin/lib/confirm';
import { PUBLISH_STATUS_CONFIG, PUBLISH_STATUS_OPTIONS } from '@/admin/lib/cms-shared';
import { pageService, PAGE_QUERY_KEY, type SitePage } from './page.service';

const COLUMNS: TableColumn<SitePage>[] = [
  { key: 'sortOrder', label: '#', type: 'sort', align: 'center' },
  {
    key: 'title',
    label: 'Tiêu đề trang',
    type: 'text',
    align: 'left',
    link: (row) => `/admin/pages/edit/${row.id}`,
  },
  { key: 'slug', label: 'Slug', type: 'badge', align: 'left' },
  {
    key: 'status',
    label: 'Trạng thái',
    type: 'status',
    align: 'center',
    statusConfig: PUBLISH_STATUS_CONFIG,
  },
  {
    key: 'sections',
    label: 'Số section',
    type: 'custom',
    align: 'center',
    render: (row) => String(row.sections?.length ?? 0),
  },
  { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
];

const FILTERS: TableFilterOption[] = [
  {
    key: 'status',
    label: 'Tất cả trạng thái',
    options: PUBLISH_STATUS_OPTIONS.map((o) => ({ label: o.label, value: String(o.value) })),
  },
];

export function PageList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleAction(event: TableActionEvent<SitePage>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push('/admin/pages/create');
        break;
      case 'edit':
        if (item?.id) router.push(`/admin/pages/edit/${item.id}`);
        break;
      case 'sort':
        if (item?.id && event.value) {
          await pageService.sort(item.id, event.value);
          queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEY });
        }
        break;
      case 'delete':
        if (item?.id) {
          await confirmAction(
            {
              title: 'Xóa trang?',
              text: `Trang "${item.title}" và toàn bộ section của nó sẽ bị xóa.`,
              confirmButtonText: 'Xóa',
            },
            () => pageService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <DataTable<SitePage>
      title="Trang nội dung"
      subtitle="Các trang tĩnh của website (giới thiệu, giải pháp, liên hệ...)"
      queryKey={[...PAGE_QUERY_KEY]}
      columns={COLUMNS}
      fetcher={(params) => pageService.paginate(params)}
      addLabel="Thêm trang"
      searchPlaceholder="Tìm theo tiêu đề…"
      filters={FILTERS}
      onAction={handleAction}
    />
  );
}

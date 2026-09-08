'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/app/admin/_components/data-table/data-table';
import type {
  TableColumn,
  TableActionEvent,
  TableFilterOption,
} from '@/app/admin/_components/data-table/types';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { ACTIVE_STATUS_CONFIG } from '@/app/admin/_lib/cms-shared';
import { pageService, PAGE_QUERY_KEY } from '@/app/admin/(protected)/pages/_lib/page.service';
import {
  fetchSectionDefinitions,
  pageSectionService,
  PAGE_SECTION_QUERY_KEY,
  SECTION_DEFINITION_QUERY_KEY,
  type PageSection,
} from '@/app/admin/(protected)/page-sections/_lib/page-section.service';

export function PageSectionList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: pages } = useQuery({
    queryKey: [...PAGE_QUERY_KEY, 'options'],
    queryFn: () => pageService.paginate({ limit: 1000 }),
  });

  const pageTitle = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of pages?.data ?? []) map.set(p.id, p.title);
    return map;
  }, [pages]);

  // Danh mục loại section (bảng section_definitions) — hiện nhãn thay vì bắt
  // người dùng đoán key.
  const { data: definitions } = useQuery({
    queryKey: SECTION_DEFINITION_QUERY_KEY,
    queryFn: fetchSectionDefinitions,
    staleTime: 5 * 60_000,
  });
  const definitionLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of definitions ?? []) map.set(d.sectionKey, d.label);
    return map;
  }, [definitions]);

  const columns: TableColumn<PageSection>[] = useMemo(
    () => [
      { key: 'sortOrder', label: '#', type: 'sort', align: 'center' },
      {
        key: 'pageId',
        label: 'Trang',
        type: 'custom',
        align: 'left',
        render: (row) => pageTitle.get(row.pageId) ?? `#${row.pageId}`,
      },
      { key: 'sectionKey', label: 'Section key', type: 'badge', align: 'left' },
      {
        key: 'definition',
        label: 'Component',
        type: 'custom',
        align: 'left',
        render: (row) => {
          const component =
            typeof row.metadata?._component === 'string'
              ? (row.metadata._component as string)
              : row.sectionKey;
          return (
            definitionLabel.get(component) ?? (
              <em style={{ color: 'var(--admin-muted)' }}>generic</em>
            )
          );
        },
      },
      {
        key: 'heading',
        label: 'Heading',
        type: 'text',
        align: 'left',
        link: (row) => `/admin/page-sections/edit/${row.id}`,
      },
      {
        key: 'isActive',
        label: 'Trạng thái',
        type: 'status',
        align: 'center',
        statusConfig: ACTIVE_STATUS_CONFIG,
      },
      { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
    ],
    [pageTitle, definitionLabel],
  );

  const filters: TableFilterOption[] = useMemo(
    () => [
      {
        key: 'pageId',
        label: 'Tất cả trang',
        options: (pages?.data ?? []).map((p) => ({ label: p.title, value: String(p.id) })),
      },
    ],
    [pages],
  );

  async function handleAction(event: TableActionEvent<PageSection>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push('/admin/page-sections/create');
        break;
      case 'edit':
        if (item?.id) router.push(`/admin/page-sections/edit/${item.id}`);
        break;
      case 'sort':
        if (item?.id && event.value) {
          await pageSectionService.sort(item.id, event.value);
          queryClient.invalidateQueries({ queryKey: PAGE_SECTION_QUERY_KEY });
        }
        break;
      case 'delete':
        if (item?.id) {
          await confirmAction(
            {
              title: 'Xóa section?',
              text: `Section "${item.heading ?? item.sectionKey}" sẽ bị xóa khỏi trang.`,
              confirmButtonText: 'Xóa',
            },
            () => pageSectionService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: PAGE_SECTION_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <DataTable<PageSection>
      title="Section trang"
      subtitle="Từng khối nội dung của các trang tĩnh"
      queryKey={[...PAGE_SECTION_QUERY_KEY]}
      columns={columns}
      fetcher={(params) => pageSectionService.paginate(params)}
      addLabel="Thêm section"
      searchPlaceholder="Tìm kiếm…"
      filters={filters}
      onAction={handleAction}
    />
  );
}

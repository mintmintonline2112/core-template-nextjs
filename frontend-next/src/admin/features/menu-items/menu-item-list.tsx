'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataTable } from '@/admin/components/data-table/data-table';
import type {
  TableColumn,
  TableActionEvent,
  TableFilterOption,
} from '@/admin/components/data-table/types';
import { confirmAction } from '@/admin/lib/confirm';
import { ACTIVE_STATUS_CONFIG } from '@/admin/lib/cms-shared';
import { menuItemService, MENU_ITEM_QUERY_KEY, type MenuItem } from './menu-item.service';

export function MenuItemList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: allItems } = useQuery({
    queryKey: [...MENU_ITEM_QUERY_KEY, 'options'],
    queryFn: () => menuItemService.paginate({ limit: 1000 }),
  });

  const parentLabel = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of allItems?.data ?? []) map.set(item.id, item.label);
    return map;
  }, [allItems]);

  const rootItems = useMemo(
    () => (allItems?.data ?? []).filter((item) => item.parentId == null),
    [allItems],
  );

  const columns: TableColumn<MenuItem>[] = useMemo(
    () => [
      { key: 'sortOrder', label: '#', type: 'sort', align: 'center' },
      {
        key: 'label',
        label: 'Tên menu',
        type: 'text',
        align: 'left',
        link: (row) => `/admin/menus/edit/${row.id}`,
      },
      { key: 'href', label: 'Đường dẫn', type: 'badge', align: 'left' },
      {
        key: 'parentId',
        label: 'Thuộc menu',
        type: 'custom',
        align: 'center',
        render: (row) =>
          row.parentId == null ? (
            <span className="dt-status is-success">Menu gốc</span>
          ) : (
            (parentLabel.get(row.parentId) ?? `#${row.parentId}`)
          ),
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
    [parentLabel],
  );

  const filters: TableFilterOption[] = useMemo(
    () => [
      {
        key: 'parentId',
        label: 'Tất cả cấp',
        options: rootItems.map((item) => ({
          label: `Submenu của: ${item.label}`,
          value: String(item.id),
        })),
      },
    ],
    [rootItems],
  );

  async function handleAction(event: TableActionEvent<MenuItem>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push('/admin/menus/create');
        break;
      case 'edit':
        if (item?.id) router.push(`/admin/menus/edit/${item.id}`);
        break;
      case 'sort':
        if (item?.id && event.value) {
          await menuItemService.sort(item.id, event.value);
          queryClient.invalidateQueries({ queryKey: MENU_ITEM_QUERY_KEY });
        }
        break;
      case 'toggle':
        if (item?.id) {
          await menuItemService.edit(item.id, { isActive: !item.isActive });
          queryClient.invalidateQueries({ queryKey: MENU_ITEM_QUERY_KEY });
          toast.success(item.isActive ? `Đã ẩn "${item.label}"` : `Đã hiện "${item.label}"`);
        }
        break;
      case 'delete':
        if (item?.id) {
          const isRoot = item.parentId == null;
          await confirmAction(
            {
              title: 'Xóa menu?',
              text: isRoot
                ? `Menu "${item.label}" và toàn bộ submenu của nó sẽ bị xóa.`
                : `Xóa mục "${item.label}" khỏi submenu?`,
              confirmButtonText: 'Xóa',
            },
            () => menuItemService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: MENU_ITEM_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <DataTable<MenuItem>
      title="Menu website"
      subtitle="Sắp xếp menu ở header website và submenu từng mục"
      queryKey={[...MENU_ITEM_QUERY_KEY]}
      columns={columns}
      fetcher={(params) => menuItemService.paginate(params)}
      addLabel="Thêm menu"
      searchPlaceholder="Tìm theo tên, đường dẫn…"
      filters={filters}
      enabledActions={['toggle', 'edit', 'delete']}
      onAction={handleAction}
    />
  );
}

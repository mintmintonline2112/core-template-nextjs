'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/app/admin/_components/data-table/data-table';
import type { TableColumn, TableActionEvent } from '@/app/admin/_components/data-table/types';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { roleService, ROLE_QUERY_KEY, type Role } from '@/app/admin/(protected)/roles/_lib/role.service';

export function RoleList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const columns: TableColumn<Role>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Tên vai trò',
        type: 'text',
        align: 'left',
        link: (row) => `/admin/roles/edit/${row.id}`,
      },
      { key: 'description', label: 'Mô tả', type: 'text', align: 'left' },
      {
        key: 'permissions',
        label: 'Số quyền',
        type: 'custom',
        align: 'center',
        render: (row) => <span className="dt-badge">{row.permissions?.length ?? 0}</span>,
      },
      { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
    ],
    [],
  );

  async function handleAction(event: TableActionEvent<Role>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push('/admin/roles/create');
        break;
      case 'edit':
        if (item?.id) router.push(`/admin/roles/edit/${item.id}`);
        break;
      case 'delete':
        if (item?.id) {
          await confirmAction(
            {
              title: 'Xóa vai trò?',
              text: `Vai trò "${item.name}" sẽ bị xóa. Nhân sự đang giữ vai trò này sẽ mất quyền tương ứng.`,
              confirmButtonText: 'Xóa',
            },
            () => roleService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <DataTable<Role>
      title="Vai trò"
      subtitle="Nhóm quyền để phân công phạm vi quản trị"
      queryKey={[...ROLE_QUERY_KEY]}
      columns={columns}
      fetcher={(params) => roleService.paginate(params)}
      addLabel="Thêm vai trò"
      searchPlaceholder="Tìm vai trò…"
      onAction={handleAction}
    />
  );
}

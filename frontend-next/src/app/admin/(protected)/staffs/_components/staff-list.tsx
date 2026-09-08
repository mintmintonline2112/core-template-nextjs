'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataTable } from '@/app/admin/_components/data-table/data-table';
import type {
  TableColumn,
  TableActionEvent,
  TableStatusConfig,
} from '@/app/admin/_components/data-table/types';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { getErrorMessage } from '@/app/admin/_lib/utils';
import { staffService, STAFF_QUERY_KEY, type Staff } from '@/app/admin/(protected)/staffs/_lib/staff.service';

const STATUS_CONFIG: TableStatusConfig[] = [
  { value: 'active', label: 'Hoạt động', className: 'is-success' },
  { value: 'blocked', label: 'Bị khóa', className: 'is-danger' },
  { value: 'pending', label: 'Chờ duyệt', className: 'is-warning' },
  { value: 'inactive', label: 'Ngưng', className: 'is-muted' },
];

export function StaffList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const columns: TableColumn<Staff>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Họ tên',
        type: 'text',
        align: 'left',
        link: (row) => `/admin/staffs/edit/${row.id}`,
      },
      { key: 'email', label: 'Email', type: 'text', align: 'left' },
      { key: 'staffCode', label: 'Mã NS', type: 'badge', align: 'center' },
      {
        key: 'role',
        label: 'Vai trò',
        type: 'custom',
        align: 'center',
        render: (row) => row.role?.name ?? '—',
      },
      {
        key: 'status',
        label: 'Trạng thái',
        type: 'status',
        align: 'center',
        statusConfig: STATUS_CONFIG,
      },
      { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
    ],
    [],
  );

  async function handleAction(event: TableActionEvent<Staff>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push('/admin/staffs/create');
        break;
      case 'edit':
        if (item?.id) router.push(`/admin/staffs/edit/${item.id}`);
        break;
      case 'block':
        if (item?.id) {
          try {
            await staffService.toggleBlock(item.id);
            toast.success(
              item.status === 'blocked'
                ? `Đã mở khóa "${item.name}"`
                : `Đã khóa "${item.name}"`,
            );
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
          queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY });
        }
        break;
      case 'delete':
        if (item?.id) {
          await confirmAction(
            {
              title: 'Xóa nhân sự?',
              text: `Tài khoản "${item.name}" (${item.email}) sẽ bị xóa.`,
              confirmButtonText: 'Xóa',
            },
            () => staffService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <DataTable<Staff>
      title="Nhân sự"
      subtitle="Tài khoản được phép truy cập khu vực quản trị"
      queryKey={[...STAFF_QUERY_KEY]}
      columns={columns}
      fetcher={(params) => staffService.paginate(params)}
      addLabel="Thêm nhân sự"
      searchPlaceholder="Tìm tên hoặc email…"
      enabledActions={['block', 'edit', 'delete']}
      onAction={handleAction}
    />
  );
}

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/app/admin/_components/data-table/data-table';
import type { TableColumn, TableFilterOption } from '@/app/admin/_components/data-table/types';
import {
  permissionService,
  PERMISSION_QUERY_KEY,
  type Permission,
} from '@/app/admin/(protected)/permissions/_lib/permission.service';

const COLUMNS: TableColumn<Permission>[] = [
  { key: 'name', label: 'Tên quyền', type: 'text', align: 'left' },
  { key: 'code', label: 'Mã quyền', type: 'badge', align: 'left' },
  { key: 'module', label: 'Module', type: 'badge', align: 'center' },
  { key: 'description', label: 'Mô tả', type: 'text', align: 'left' },
];

export function PermissionList() {
  const { data: all } = useQuery({
    queryKey: [...PERMISSION_QUERY_KEY, 'options'],
    queryFn: () => permissionService.paginate({ limit: 1000 }),
  });

  const filters: TableFilterOption[] = useMemo(() => {
    const modules = Array.from(
      new Set((all?.data ?? []).map((p) => p.module).filter(Boolean)),
    ).sort();
    return [
      {
        key: 'module',
        label: 'Tất cả module',
        options: modules.map((m) => ({ label: m, value: m })),
      },
    ];
  }, [all]);

  return (
    <DataTable<Permission>
      title="Phân quyền"
      subtitle="Danh sách quyền sinh tự động từ các module backend (chỉ xem)"
      queryKey={[...PERMISSION_QUERY_KEY]}
      columns={COLUMNS}
      fetcher={(params) => permissionService.paginate(params)}
      showAdd={false}
      searchPlaceholder="Tìm mã quyền…"
      filters={filters}
      enabledActions={[]}
    />
  );
}

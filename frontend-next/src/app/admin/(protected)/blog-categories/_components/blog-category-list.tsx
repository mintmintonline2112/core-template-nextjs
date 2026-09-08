'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/app/admin/_components/data-table/data-table';
import type { TableColumn, TableActionEvent } from '@/app/admin/_components/data-table/types';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { ACTIVE_STATUS_CONFIG, formatDate } from '@/app/admin/_lib/cms-shared';
import {
  blogCategoryService,
  BLOG_CATEGORY_QUERY_KEY,
  type BlogCategory,
} from '@/app/admin/(protected)/blog-categories/_lib/blog-category.service';

const COLUMNS: TableColumn<BlogCategory>[] = [
  { key: 'sortOrder', label: '#', type: 'sort', align: 'center' },
  {
    key: 'name',
    label: 'Tên danh mục',
    type: 'custom',
    align: 'left',
    render: (row) => (
      <>
        {row.name}
        {row.displayName && row.displayName !== row.name && (
          <small className="dt-sub">Ngoài website: {row.displayName}</small>
        )}
      </>
    ),
  },
  { key: 'slug', label: 'Slug', type: 'badge', align: 'left' },
  {
    key: 'isActive',
    label: 'Trạng thái',
    type: 'status',
    align: 'center',
    statusConfig: ACTIVE_STATUS_CONFIG,
  },
  {
    key: 'createdAt',
    label: 'Ngày tạo',
    type: 'custom',
    align: 'center',
    render: (row) => formatDate(row.createdAt),
  },
  { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
];

export function BlogCategoryList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleAction(event: TableActionEvent<BlogCategory>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push('/admin/blog-categories/create');
        break;
      case 'edit':
        if (item?.id) router.push(`/admin/blog-categories/edit/${item.id}`);
        break;
      case 'sort':
        if (item?.id && event.value) {
          await blogCategoryService.sort(item.id, event.value);
          queryClient.invalidateQueries({ queryKey: BLOG_CATEGORY_QUERY_KEY });
        }
        break;
      case 'delete':
        if (item?.id) {
          await confirmAction(
            {
              title: 'Xóa danh mục?',
              text: `Xóa danh mục "${item.name}"? Bài viết thuộc danh mục sẽ chuyển về "Không có danh mục".`,
              confirmButtonText: 'Xóa',
            },
            () => blogCategoryService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: BLOG_CATEGORY_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <DataTable<BlogCategory>
      title="Danh mục blog"
      subtitle="Phân loại bài viết kiến thức nha khoa"
      queryKey={[...BLOG_CATEGORY_QUERY_KEY]}
      columns={COLUMNS}
      fetcher={(params) => blogCategoryService.paginate(params)}
      addLabel="Thêm danh mục"
      searchPlaceholder="Tìm theo tên…"
      onAction={handleAction}
    />
  );
}

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/admin/components/data-table/data-table';
import type {
  TableColumn,
  TableActionEvent,
  TableFilterOption,
} from '@/admin/components/data-table/types';
import { confirmAction } from '@/admin/lib/confirm';
import { PUBLISH_STATUS_CONFIG, PUBLISH_STATUS_OPTIONS, formatDate } from '@/admin/lib/cms-shared';
import {
  blogCategoryService,
  BLOG_CATEGORY_QUERY_KEY,
} from '@/admin/features/blog-categories/blog-category.service';
import { blogPostService, BLOG_POST_QUERY_KEY, type BlogPost } from './blog-post.service';

export function BlogPostList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: [...BLOG_CATEGORY_QUERY_KEY, 'options'],
    queryFn: () => blogCategoryService.paginate({ limit: 1000 }),
  });

  const categoryName = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of categories?.data ?? []) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const columns: TableColumn<BlogPost>[] = useMemo(
    () => [
      { key: 'coverImagePath', label: 'Ảnh', type: 'image', align: 'center' },
      {
        key: 'title',
        label: 'Tiêu đề',
        type: 'text',
        align: 'left',
        link: (row) => `/admin/blog-posts/edit/${row.id}`,
      },
      {
        key: 'categoryId',
        label: 'Danh mục',
        type: 'custom',
        align: 'center',
        render: (row) =>
          row.categoryId != null ? (categoryName.get(row.categoryId) ?? `#${row.categoryId}`) : '—',
      },
      {
        key: 'status',
        label: 'Trạng thái',
        type: 'status',
        align: 'center',
        statusConfig: PUBLISH_STATUS_CONFIG,
      },
      {
        key: 'publishedAt',
        label: 'Ngày đăng',
        type: 'custom',
        align: 'center',
        render: (row) => formatDate(row.publishedAt),
      },
      { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
    ],
    [categoryName],
  );

  const filters: TableFilterOption[] = useMemo(
    () => [
      {
        key: 'status',
        label: 'Tất cả trạng thái',
        options: PUBLISH_STATUS_OPTIONS.map((o) => ({ label: o.label, value: String(o.value) })),
      },
      {
        key: 'categoryId',
        label: 'Tất cả danh mục',
        options: (categories?.data ?? []).map((c) => ({ label: c.name, value: String(c.id) })),
      },
    ],
    [categories],
  );

  async function handleAction(event: TableActionEvent<BlogPost>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push('/admin/blog-posts/create');
        break;
      case 'edit':
        if (item?.id) router.push(`/admin/blog-posts/edit/${item.id}`);
        break;
      case 'delete':
        if (item?.id) {
          await confirmAction(
            {
              title: 'Xóa bài viết?',
              text: `Bài viết "${item.title}" sẽ bị xóa. Thao tác này không thể hoàn tác.`,
              confirmButtonText: 'Xóa',
            },
            () => blogPostService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: BLOG_POST_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <DataTable<BlogPost>
      title="Bài viết"
      subtitle="Kiến thức nha khoa trên website"
      queryKey={[...BLOG_POST_QUERY_KEY]}
      columns={columns}
      fetcher={(params) => blogPostService.paginate(params)}
      addLabel="Viết bài mới"
      searchPlaceholder="Tìm theo tiêu đề, mô tả…"
      filters={filters}
      onAction={handleAction}
    />
  );
}

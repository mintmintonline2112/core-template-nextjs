'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { GenericForm } from '@/app/admin/_components/generic-form/generic-form';
import type { GenericFormField } from '@/app/admin/_components/generic-form/types';
import { pageService, PAGE_QUERY_KEY } from '@/app/admin/(protected)/pages/_lib/page.service';
import { adminRoutes } from '@/config/routes';

/**
 * Bước 1 khi tạo section: chọn trang. Bước 2 (PageSectionForm, ?pageId=) khoá
 * trang đó và chỉ liệt kê component dành cho trang.
 */
export function PageSectionPagePicker() {
  const router = useRouter();

  const { data: pages } = useQuery({
    queryKey: [...PAGE_QUERY_KEY, 'options'],
    queryFn: () => pageService.paginate({ limit: 1000 }),
  });

  const fields: GenericFormField[] = useMemo(
    () => [
      {
        key: 'pageId',
        label: 'Thuộc trang',
        type: 'select',
        required: true,
        placeholder: 'Chọn trang',
        options: (pages?.data ?? []).map((p) => ({ label: `${p.title} (/${p.slug})`, value: p.id })),
        hint: 'Sau khi chọn, trang được khoá lại và danh sách component chỉ hiện các khối dành cho trang này.',
      },
    ],
    [pages],
  );

  return (
    <GenericForm<{ pageId: string }>
      title="Tạo section"
      subtitle="Bước 1/2 — chọn trang sẽ thêm section"
      breadcrumbs={[
        { label: 'Section trang', link: adminRoutes.pageSections.list },
        { label: 'Tạo mới' },
      ]}
      fields={fields}
      defaultValues={{ pageId: '' }}
      submitLabel="Tiếp tục"
      onSubmit={(values) => router.push(`${adminRoutes.pageSections.create}?pageId=${values.pageId}`)}
      onCancel={() => router.push(adminRoutes.pageSections.list)}
    />
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/app/admin/_components/generic-form/generic-form';
import type { GenericFormField, GenericSelectOption } from '@/app/admin/_components/generic-form/types';
import {
  SEO_FIELDS,
  EMPTY_SEO,
  seoValuesFrom,
  seoPayload,
  type SeoFormValues,
  SEO_NULLABLE_KEYS,
} from '@/app/admin/_lib/seo-fields';
import { getErrorMessage } from '@/app/admin/_lib/utils';
import { buildPayload } from '@/app/admin/_lib/crud-service';
import {
  ZH_GROUP,
  zhFields,
  zhValuesFrom,
  zhTranslationsPayload,
} from '@/app/admin/_lib/translation-fields';
import { blogCategoryService, BLOG_CATEGORY_QUERY_KEY } from '@/app/admin/(protected)/blog-categories/_lib/blog-category.service';

interface FormValues extends SeoFormValues {
  name: string;
  displayName: string;
  parentId: string;
  description: string;
  isActive: boolean;
  zh_name: string;
  zh_description: string;
}

const ZH_KEYS = ['name', 'description'] as const;

const EMPTY: FormValues = {
  name: '',
  displayName: '',
  parentId: '',
  description: '',
  isActive: true,
  ...EMPTY_SEO,
  zh_name: '',
  zh_description: '',
};

export function BlogCategoryForm({ id }: { id?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(EMPTY);
  const [formKey, setFormKey] = useState(0);

  const { data: categories } = useQuery({
    queryKey: [...BLOG_CATEGORY_QUERY_KEY, 'options'],
    queryFn: () => blogCategoryService.paginate({ limit: 1000 }),
  });

  const parentOptions: GenericSelectOption[] = useMemo(
    () =>
      (categories?.data ?? [])
        .filter((c) => c.id !== id)
        .map((c) => ({ label: c.name, value: c.id })),
    [categories, id],
  );

  const { data } = useQuery({
    queryKey: [...BLOG_CATEGORY_QUERY_KEY, 'detail', id],
    queryFn: () => blogCategoryService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setInitialValues({
        name: data.name ?? '',
        displayName: data.displayName ?? '',
        parentId: data.parentId != null ? String(data.parentId) : '',
        description: data.description ?? '',
        isActive: data.isActive ?? true,
        ...seoValuesFrom(data),
        ...zhValuesFrom(data.translations, ZH_KEYS),
      });
      setFormKey((k) => k + 1);
    }
  }, [data]);

  const FIELDS: GenericFormField[] = useMemo(
    () => [
      { key: 'name', label: 'Tên danh mục', type: 'text', required: true, placeholder: 'VD: Niềng răng' },
      {
        key: 'displayName',
        label: 'Tên hiển thị ngoài website',
        type: 'text',
        placeholder: 'Để trống = dùng Tên danh mục',
        hint: 'Dùng khi tên trong dashboard cần rõ hơn để phân biệt. VD: tên "Ca Veneer" nhưng ngoài website chỉ hiện "Veneer".',
      },
      { key: 'parentId', label: 'Danh mục cha', type: 'select', placeholder: '— Không có —', options: parentOptions },
      { key: 'description', label: 'Mô tả', type: 'textarea', placeholder: 'Mô tả ngắn về danh mục' },
      { key: 'isActive', label: 'Hiển thị', type: 'checkbox', hint: 'Cho phép hiển thị trên website' },
      ...SEO_FIELDS,
      ...zhFields([
        { key: 'name', label: 'Tên danh mục', type: 'text' },
        { key: 'description', label: 'Mô tả', type: 'textarea' },
      ]),
    ],
    [parentOptions],
  );

  async function handleSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const payload = buildPayload(
        {
          name: values.name,
          displayName: values.displayName.trim() || null,
          description: values.description,
          isActive: values.isActive,
          parentId: values.parentId ? Number(values.parentId) : null,
          ...seoPayload(values),
          translations: zhTranslationsPayload(values, ZH_KEYS, data?.translations),
        },
        { keepNull: ['parentId', 'displayName', 'translations', ...SEO_NULLABLE_KEYS] },
      );

      if (isEdit) await blogCategoryService.edit(id!, payload);
      else await blogCategoryService.add(payload);

      await queryClient.invalidateQueries({ queryKey: BLOG_CATEGORY_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục');
      router.push('/admin/blog-categories');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={isEdit ? 'Sửa danh mục' : 'Tạo danh mục'}
      subtitle={isEdit ? 'Cập nhật thông tin danh mục blog' : 'Thêm danh mục blog mới'}
      breadcrumbs={[
        { label: 'Danh mục blog', link: '/admin/blog-categories' },
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={FIELDS}
      groups={[ZH_GROUP]}
      defaultValues={initialValues}
      loading={submitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/admin/blog-categories')}
    />
  );
}

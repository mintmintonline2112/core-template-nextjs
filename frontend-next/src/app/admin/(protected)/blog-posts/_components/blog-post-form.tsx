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
import {
  PUBLISH_STATUS_OPTIONS,
  toDateInput,
  type PublishStatus,
} from '@/app/admin/_lib/cms-shared';
import {
  blogCategoryService,
  BLOG_CATEGORY_QUERY_KEY,
} from '@/app/admin/(protected)/blog-categories/_lib/blog-category.service';
import { blogPostService, BLOG_POST_QUERY_KEY } from '@/app/admin/(protected)/blog-posts/_lib/blog-post.service';
import { adminRoutes } from '@/config/routes';

interface FormValues extends SeoFormValues {
  title: string;
  categoryId: string;
  status: PublishStatus;
  publishedAt: string;
  excerpt: string;
  content: string;
  coverImagePath: string | File | null;
  zh_title: string;
  zh_excerpt: string;
  zh_content: string;
  zh_metaTitle: string;
  zh_metaDescription: string;
}

const ZH_KEYS = ['title', 'excerpt', 'content', 'metaTitle', 'metaDescription'] as const;

/**
 * Ảnh bìa: File (upload mới) gửi nguyên; URL từ Thư viện → rút về đường dẫn
 * tương đối "uploads/..." (không dính domain, khớp sync-content.js); null khi
 * đang sửa và người dùng xóa ảnh; tạo mới không có ảnh → bỏ qua.
 */
function coverPayload(value: string | File | null, isEdit: boolean): string | File | null | undefined {
  if (value instanceof File) return value;
  if (typeof value === 'string' && value.trim()) {
    return value.replace(/^https?:\/\/[^/]+\//i, '').replace(/^\//, '');
  }
  return isEdit ? null : undefined;
}

const EMPTY: FormValues = {
  title: '',
  categoryId: '',
  status: 'draft',
  publishedAt: '',
  excerpt: '',
  content: '',
  coverImagePath: null,
  ...EMPTY_SEO,
  zh_title: '',
  zh_excerpt: '',
  zh_content: '',
  zh_metaTitle: '',
  zh_metaDescription: '',
};

export function BlogPostForm({ id }: { id?: number }) {
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

  const categoryOptions: GenericSelectOption[] = useMemo(
    () => (categories?.data ?? []).map((c) => ({ label: c.name, value: c.id })),
    [categories],
  );

  const { data } = useQuery({
    queryKey: [...BLOG_POST_QUERY_KEY, 'detail', id],
    queryFn: () => blogPostService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setInitialValues({
        title: data.title ?? '',
        categoryId: data.categoryId != null ? String(data.categoryId) : '',
        status: data.status ?? 'draft',
        publishedAt: toDateInput(data.publishedAt),
        excerpt: data.excerpt ?? '',
        content: data.content ?? '',
        coverImagePath: data.coverImagePath ?? null,
        ...seoValuesFrom(data),
        ...zhValuesFrom(data.translations, ZH_KEYS),
      });
      setFormKey((k) => k + 1);
    }
  }, [data]);

  const FIELDS: GenericFormField[] = useMemo(
    () => [
      { key: 'coverImagePath', label: 'Ảnh bìa', type: 'image' },
      { key: 'title', label: 'Tiêu đề', type: 'text', required: true, placeholder: 'Nhập tiêu đề bài viết' },
      { key: 'categoryId', label: 'Danh mục', type: 'select', placeholder: '— Không có —', options: categoryOptions },
      { key: 'status', label: 'Trạng thái', type: 'select', required: true, options: PUBLISH_STATUS_OPTIONS },
      { key: 'publishedAt', label: 'Ngày đăng', type: 'date', hint: 'Để trống nếu đăng ngay khi xuất bản' },
      { key: 'excerpt', label: 'Mô tả ngắn', type: 'textarea', placeholder: 'Tóm tắt hiển thị ở danh sách bài viết' },
      { key: 'content', label: 'Nội dung', type: 'richtext', required: true, placeholder: 'Viết nội dung bài…' },
      ...SEO_FIELDS,
      ...zhFields([
        { key: 'title', label: 'Tiêu đề', type: 'text' },
        { key: 'excerpt', label: 'Mô tả ngắn', type: 'textarea' },
        { key: 'content', label: 'Nội dung', type: 'richtext' },
        { key: 'metaTitle', label: 'SEO · Meta Title', type: 'text' },
        { key: 'metaDescription', label: 'SEO · Meta Description', type: 'textarea' },
      ]),
    ],
    [categoryOptions],
  );

  async function handleSubmit(values: FormValues) {
    if (!values.content || values.content === '<p></p>') {
      toast.error('Nội dung bài viết không được để trống');
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload(
        {
          title: values.title,
          status: values.status,
          publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
          excerpt: values.excerpt,
          content: values.content,
          categoryId: values.categoryId ? Number(values.categoryId) : null,
          coverImagePath: coverPayload(values.coverImagePath, isEdit),
          ...seoPayload(values),
          translations: zhTranslationsPayload(values, ZH_KEYS, data?.translations),
        },
        { keepNull: ['categoryId', 'translations', 'coverImagePath', ...SEO_NULLABLE_KEYS] },
      );

      if (isEdit) await blogPostService.edit(id!, payload);
      else await blogPostService.add(payload);

      await queryClient.invalidateQueries({ queryKey: BLOG_POST_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết');
      router.push(adminRoutes.blogPosts.list);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={isEdit ? 'Sửa bài viết' : 'Viết bài mới'}
      subtitle={isEdit ? 'Cập nhật nội dung bài viết' : 'Thêm bài viết mới'}
      breadcrumbs={[
        { label: 'Bài viết', link: adminRoutes.blogPosts.list },
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={FIELDS}
      groups={[ZH_GROUP]}
      defaultValues={initialValues}
      loading={submitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Đăng bài'}
      onSubmit={handleSubmit}
      onCancel={() => router.push(adminRoutes.blogPosts.list)}
    />
  );
}

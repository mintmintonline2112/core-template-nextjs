'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/app/admin/_components/generic-form/generic-form';
import type { GenericFormField } from '@/app/admin/_components/generic-form/types';
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
import { PUBLISH_STATUS_OPTIONS, type PublishStatus } from '@/app/admin/_lib/cms-shared';
import {
  ZH_GROUP,
  zhFields,
  zhValuesFrom,
  zhTranslationsPayload,
} from '@/app/admin/_lib/translation-fields';
import { pageService, PAGE_QUERY_KEY } from '@/app/admin/(protected)/pages/_lib/page.service';

interface FormValues extends SeoFormValues {
  title: string;
  eyebrow: string;
  lead: string;
  templateKey: string;
  status: PublishStatus;
  zh_title: string;
  zh_eyebrow: string;
  zh_lead: string;
  zh_metaTitle: string;
  zh_metaDescription: string;
}

const ZH_KEYS = ['title', 'eyebrow', 'lead', 'metaTitle', 'metaDescription'] as const;

const EMPTY: FormValues = {
  title: '',
  eyebrow: '',
  lead: '',
  templateKey: '',
  status: 'draft',
  ...EMPTY_SEO,
  zh_title: '',
  zh_eyebrow: '',
  zh_lead: '',
  zh_metaTitle: '',
  zh_metaDescription: '',
};

const FIELDS: GenericFormField[] = [
  { key: 'title', label: 'Tiêu đề trang', type: 'text', required: true, placeholder: 'VD: Our Products' },
  { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Dòng chữ nhỏ phía trên tiêu đề (VD: Về chúng tôi)' },
  { key: 'lead', label: 'Đoạn dẫn', type: 'textarea', placeholder: 'Đoạn mô tả ngắn dưới tiêu đề trang' },
  { key: 'templateKey', label: 'Template key', type: 'text', placeholder: 'VD: about, services', hint: 'Khóa nhận diện template render phía frontend' },
  { key: 'status', label: 'Trạng thái', type: 'select', required: true, options: PUBLISH_STATUS_OPTIONS },
  ...SEO_FIELDS,
  ...zhFields([
    { key: 'title', label: 'Tiêu đề trang', type: 'text' },
    { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { key: 'lead', label: 'Đoạn dẫn', type: 'textarea' },
    { key: 'metaTitle', label: 'SEO · Meta Title', type: 'text' },
    { key: 'metaDescription', label: 'SEO · Meta Description', type: 'textarea' },
  ]),
];

export function PageForm({ id }: { id?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(EMPTY);
  const [formKey, setFormKey] = useState(0);

  const { data } = useQuery({
    queryKey: [...PAGE_QUERY_KEY, 'detail', id],
    queryFn: () => pageService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setInitialValues({
        title: data.title ?? '',
        eyebrow: data.eyebrow ?? '',
        lead: data.lead ?? '',
        templateKey: data.templateKey ?? '',
        status: data.status ?? 'draft',
        ...seoValuesFrom(data),
        ...zhValuesFrom(data.translations, ZH_KEYS),
      });
      setFormKey((k) => k + 1);
    }
  }, [data]);

  const sections = useMemo(
    () => (data?.sections ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [data],
  );

  async function handleSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const payload = buildPayload(
        {
          title: values.title,
          // Xóa trắng = gửi null để backend xóa giá trị cũ (xem seoPayload).
          eyebrow: values.eyebrow.trim() ? values.eyebrow : null,
          lead: values.lead.trim() ? values.lead : null,
          templateKey: values.templateKey.trim() ? values.templateKey : null,
          status: values.status,
          ...seoPayload(values),
          translations: zhTranslationsPayload(values, ZH_KEYS, data?.translations),
        },
        { keepNull: ['translations', 'eyebrow', 'lead', 'templateKey', ...SEO_NULLABLE_KEYS] },
      );

      if (isEdit) await pageService.edit(id!, payload);
      else await pageService.add(payload);

      await queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật trang' : 'Đã tạo trang');
      router.push('/admin/pages');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <GenericForm<FormValues>
        key={formKey}
        title={isEdit ? 'Sửa trang' : 'Tạo trang'}
        subtitle={isEdit ? 'Cập nhật thông tin trang nội dung' : 'Thêm trang nội dung mới'}
        breadcrumbs={[
          { label: 'Trang nội dung', link: '/admin/pages' },
          { label: isEdit ? 'Sửa' : 'Tạo mới' },
        ]}
        fields={FIELDS}
        groups={[ZH_GROUP]}
        defaultValues={initialValues}
        loading={submitting}
        submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/pages')}
      />

      {isEdit && sections.length > 0 && (
        <div className="gf-card" style={{ marginTop: 24 }}>
          <div>
            <label className="gf-label">Section thuộc trang này ({sections.length})</label>
            <table className="dt-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Section key</th>
                  <th>Heading</th>
                  <th className="is-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => (
                  <tr key={s.id}>
                    <td>{s.sortOrder}</td>
                    <td><span className="dt-badge">{s.sectionKey}</span></td>
                    <td>
                      <Link href={`/admin/page-sections/edit/${s.id}`} className="dt-link">
                        {s.heading ?? s.sectionKey}
                      </Link>
                    </td>
                    <td className="is-center">
                      <span className={`dt-status ${s.isActive ? 'is-success' : 'is-muted'}`}>
                        {s.isActive ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="gf-hint">
              Nội dung từng section chỉnh tại mục{' '}
              <Link href="/admin/page-sections" className="dt-link">Section trang</Link>.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

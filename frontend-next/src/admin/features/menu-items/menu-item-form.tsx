'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/admin/components/generic-form/generic-form';
import type { GenericFormField, GenericSelectOption } from '@/admin/components/generic-form/types';
import { getErrorMessage } from '@/admin/lib/utils';
import { buildPayload } from '@/admin/core/crud-service';
import {
  ZH_GROUP,
  zhFields,
  zhValuesFrom,
  zhTranslationsPayload,
} from '@/admin/lib/translation-fields';
import { menuItemService, MENU_ITEM_QUERY_KEY } from './menu-item.service';

interface FormValues {
  label: string;
  href: string;
  parentId: string;
  description: string;
  isActive: boolean;
  showSubmenu: boolean;
  sortOrder: number;
  zh_label: string;
}

const ZH_KEYS = ['label'] as const;

const EMPTY: FormValues = {
  label: '',
  href: '',
  parentId: '',
  description: '',
  isActive: true,
  showSubmenu: true,
  sortOrder: 1,
  zh_label: '',
};

export function MenuItemForm({ id }: { id?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(EMPTY);
  const [formKey, setFormKey] = useState(0);

  const { data: allItems } = useQuery({
    queryKey: [...MENU_ITEM_QUERY_KEY, 'options'],
    queryFn: () => menuItemService.paginate({ limit: 1000 }),
  });

  const parentOptions: GenericSelectOption[] = useMemo(
    () =>
      (allItems?.data ?? [])
        .filter((item) => item.parentId == null && item.id !== id)
        .map((item) => ({ label: item.label, value: item.id })),
    [allItems, id],
  );

  const { data } = useQuery({
    queryKey: [...MENU_ITEM_QUERY_KEY, 'detail', id],
    queryFn: () => menuItemService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setInitialValues({
        label: data.label ?? '',
        href: data.href ?? '',
        parentId: data.parentId != null ? String(data.parentId) : '',
        description: data.description ?? '',
        isActive: data.isActive ?? true,
        showSubmenu: data.showSubmenu ?? true,
        sortOrder: data.sortOrder ?? 1,
        ...zhValuesFrom(data.translations, ZH_KEYS),
      });
      setFormKey((k) => k + 1);
    }
  }, [data]);

  const FIELDS: GenericFormField[] = useMemo(
    () => [
      { key: 'label', label: 'Tên hiển thị', type: 'text', required: true, placeholder: 'VD: Giải pháp điều trị' },
      { key: 'href', label: 'Đường dẫn', type: 'text', required: true, placeholder: '/products hoặc /#markets', hint: 'Đường dẫn nội bộ (bắt đầu bằng /) hoặc link ngoài (https://...)' },
      { key: 'parentId', label: 'Thuộc menu', type: 'select', placeholder: '— Menu gốc (hiện trên header) —', options: parentOptions, hint: 'Chọn menu cha để biến mục này thành submenu' },
      { key: 'description', label: 'Ghi chú', type: 'text', placeholder: 'Ghi chú nội bộ (không hiển thị ngoài site)' },
      { key: 'sortOrder', label: 'Thứ tự', type: 'number', rules: { min: { value: 1, message: 'Tối thiểu là 1' } } },
      { key: 'isActive', label: 'Hiển thị', type: 'checkbox', hint: 'Cho phép hiển thị trên website' },
      { key: 'showSubmenu', label: 'Mở khung danh mục con', type: 'checkbox', hint: 'Bật: bấm menu mở khung danh mục bên phải. Tắt: bấm là đi thẳng tới trang (chỉ áp dụng menu gốc có submenu)' },
      ...zhFields([{ key: 'label', label: 'Tên hiển thị', type: 'text' }]),
    ],
    [parentOptions],
  );

  async function handleSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const payload = buildPayload(
        {
          label: values.label,
          href: values.href,
          description: values.description,
          isActive: values.isActive,
          showSubmenu: values.showSubmenu,
          sortOrder: Number.isFinite(values.sortOrder) ? values.sortOrder : undefined,
          parentId: values.parentId ? Number(values.parentId) : null,
          translations: zhTranslationsPayload(values, ZH_KEYS, data?.translations),
        },
        { keepNull: ['parentId', 'translations'] },
      );

      if (isEdit) await menuItemService.edit(id!, payload);
      else await menuItemService.add(payload);

      await queryClient.invalidateQueries({ queryKey: MENU_ITEM_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật menu' : 'Đã tạo menu');
      router.push('/admin/menus');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={isEdit ? 'Sửa menu' : 'Tạo menu'}
      subtitle={isEdit ? 'Cập nhật mục menu website' : 'Thêm mục menu cho website'}
      breadcrumbs={[
        { label: 'Menu website', link: '/admin/menus' },
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={FIELDS}
      groups={[ZH_GROUP]}
      defaultValues={initialValues}
      loading={submitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/admin/menus')}
    />
  );
}

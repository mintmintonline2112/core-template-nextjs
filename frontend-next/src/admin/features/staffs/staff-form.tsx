'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/admin/components/generic-form/generic-form';
import type { GenericFormField, GenericSelectOption } from '@/admin/components/generic-form/types';
import { getErrorMessage } from '@/admin/lib/utils';
import { buildPayload } from '@/admin/core/crud-service';
import { roleService, ROLE_QUERY_KEY } from '@/admin/features/roles/role.service';
import {
  staffService,
  STAFF_QUERY_KEY,
  type AccountStatus,
  type AccountType,
} from './staff.service';

interface FormValues {
  staffCode: string;
  name: string;
  email: string;
  type: AccountType;
  roleId: string;
  status: AccountStatus;
  password: string;
  confirmPassword: string;
}

const EMPTY: FormValues = {
  staffCode: '',
  name: '',
  email: '',
  type: 'staff',
  roleId: '',
  status: 'active',
  password: '',
  confirmPassword: '',
};

const TYPE_OPTIONS: GenericSelectOption[] = [
  { label: 'Staff', value: 'staff' },
  { label: 'Admin', value: 'admin' },
];

const STATUS_OPTIONS: GenericSelectOption[] = [
  { label: 'Hoạt động', value: 'active' },
  { label: 'Bị khóa', value: 'blocked' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Ngưng', value: 'inactive' },
];

export function StaffForm({ id }: { id?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(EMPTY);
  const [formKey, setFormKey] = useState(0);

  const { data: roles } = useQuery({
    queryKey: [...ROLE_QUERY_KEY, 'options'],
    queryFn: () => roleService.paginate({ limit: 1000 }),
  });

  const roleOptions: GenericSelectOption[] = useMemo(
    () => (roles?.data ?? []).map((r) => ({ label: r.name, value: r.id })),
    [roles],
  );

  const { data } = useQuery({
    queryKey: [...STAFF_QUERY_KEY, 'detail', id],
    queryFn: () => staffService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setInitialValues({
        staffCode: data.staffCode ?? '',
        name: data.name ?? '',
        email: data.email ?? '',
        type: data.type ?? 'staff',
        roleId: data.role?.id != null ? String(data.role.id) : '',
        status: data.status ?? 'active',
        password: '',
        confirmPassword: '',
      });
      setFormKey((k) => k + 1);
    }
  }, [data]);

  const FIELDS: GenericFormField[] = useMemo(
    () => [
      {
        key: 'staffCode',
        label: 'Mã nhân sự',
        type: 'text',
        required: !isEdit,
        disabled: isEdit,
        placeholder: 'VD: STF005',
        hint: isEdit ? 'Mã nhân sự không thể thay đổi' : undefined,
      },
      { key: 'name', label: 'Họ tên', type: 'text', required: true, placeholder: 'VD: Nguyễn Văn A' },
      { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'email@example.com' },
      { key: 'type', label: 'Loại tài khoản', type: 'select', required: true, options: TYPE_OPTIONS },
      { key: 'roleId', label: 'Vai trò', type: 'select', required: true, placeholder: 'Chọn vai trò', options: roleOptions },
      { key: 'status', label: 'Trạng thái', type: 'select', required: true, options: STATUS_OPTIONS },
      {
        key: 'password',
        label: isEdit ? 'Mật khẩu mới' : 'Mật khẩu',
        type: 'password',
        required: !isEdit,
        minLength: 6,
        showPasswordToggle: true,
        placeholder: isEdit ? 'Để trống nếu không đổi' : 'Tối thiểu 6 ký tự',
      },
      {
        key: 'confirmPassword',
        label: 'Nhập lại mật khẩu',
        type: 'password',
        required: !isEdit,
        showPasswordToggle: true,
      },
    ],
    [isEdit, roleOptions],
  );

  async function handleSubmit(values: FormValues) {
    if (values.password && values.password !== values.confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp');
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload({
        staffCode: isEdit ? undefined : values.staffCode,
        name: values.name,
        email: values.email,
        type: values.type,
        role_id: values.roleId ? Number(values.roleId) : undefined,
        status: values.status,
        password: values.password || undefined,
        confirmPassword: values.password ? values.confirmPassword : undefined,
      });

      if (isEdit) await staffService.edit(id!, payload);
      else await staffService.add(payload);

      await queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật nhân sự' : 'Đã tạo nhân sự');
      router.push('/admin/staffs');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={isEdit ? 'Sửa nhân sự' : 'Thêm nhân sự'}
      subtitle={isEdit ? 'Cập nhật tài khoản quản trị' : 'Tạo tài khoản quản trị mới'}
      breadcrumbs={[
        { label: 'Nhân sự', link: '/admin/staffs' },
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={FIELDS}
      defaultValues={initialValues}
      loading={submitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/admin/staffs')}
    />
  );
}

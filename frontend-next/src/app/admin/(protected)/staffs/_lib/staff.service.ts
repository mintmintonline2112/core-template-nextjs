import { adminApi } from '@/app/admin/_lib/admin-api';
import { createCrudService } from '@/app/admin/_lib/crud-service';

export const STAFF_QUERY_KEY = ['admin', 'staffs'] as const;

export type AccountStatus = 'active' | 'blocked' | 'pending' | 'inactive';
export type AccountType = 'admin' | 'staff';

export interface Staff {
  id: string;
  staffCode: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  type: AccountType;
  status: AccountStatus;
  role: { id: number; name: string } | null;
  lastLoginAt: string | null;
  createdAt: string;
}

const crud = createCrudService<Staff>('admin/staffs');

export const staffService = {
  ...crud,
  toggleBlock(id: string): Promise<Staff> {
    return adminApi.patch<Staff>(`admin/staffs/block/${id}`, {});
  },
};

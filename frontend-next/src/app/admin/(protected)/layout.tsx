import type { ReactNode } from 'react';
import { AdminShell } from '@/admin/layout/AdminShell';

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

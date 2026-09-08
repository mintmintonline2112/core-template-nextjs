import type { ReactNode } from 'react';
import { AdminShell } from '@/app/admin/_layout/AdminShell';

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

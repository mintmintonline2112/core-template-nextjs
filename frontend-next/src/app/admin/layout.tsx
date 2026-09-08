import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/app/admin/_auth/AuthProvider';
import { AdminProviders } from '@/app/admin/_layout/AdminProviders';
import { fontClassName } from '@/lib/fonts';
import '@/styles/admin.css';

export const metadata: Metadata = {
  title: 'Quản trị Prime Nuts CMS',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    // fontClassName gắn biến --font-barlow / --font-barlow-cond cho admin.css
    <div className={fontClassName}>
      <AuthProvider>
        <AdminProviders>{children}</AdminProviders>
      </AuthProvider>
    </div>
  );
}

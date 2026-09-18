import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/app/admin/_auth/AuthProvider';
import { AdminProviders } from '@/app/admin/_layout/AdminProviders';
import { fontClassName } from '@/lib/fonts';
import { brandNameOf, faviconHref, getSiteSettings } from '@/lib/settings';
import '@/styles/admin.css';

/** Tab dashboard mang đúng tên thương hiệu + favicon admin đã chọn (giống site public). */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Quản trị ${brandNameOf(settings)}`,
    icons: { icon: faviconHref(settings) },
    robots: { index: false, follow: false },
  };
}

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

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useAdminAuth } from '@/app/admin/_auth/AuthProvider';
import { AdminIcon } from '@/app/admin/_components/AdminIcon';
import { NotificationsBell } from '@/app/admin/_components/notifications-bell';
import { AdminSidebar } from './AdminSidebar';
import { getAdminPageTitle } from './navigation';

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready, refreshMe, logout } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    void refreshMe().then((currentUser) => {
      if (active && !currentUser) router.replace('/admin/login');
    });
    return () => {
      active = false;
    };
  }, [refreshMe, router]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await logout();
    router.replace('/admin/login');
    router.refresh();
  }, [logout, router]);

  if (!ready || !user) {
    return (
      <div className="admin-auth-loading" role="status">
        <span className="admin-loader" />
        <p>Đang xác thực phiên đăng nhập…</p>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <button
              className="admin-icon-button admin-mobile-menu"
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Mở menu quản trị"
            >
              <AdminIcon name="menu" />
            </button>
            <span>
              <small>Prime Nuts CMS</small>
              <strong>{getAdminPageTitle(pathname)}</strong>
            </span>
          </div>
          <div className="admin-topbar-actions">
            <NotificationsBell />
            <Link className="admin-site-link" href="/" target="_blank">
              Xem website
              <AdminIcon name="external" />
            </Link>
            <button
              className="admin-icon-button"
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Đăng xuất"
              title="Đăng xuất"
            >
              <AdminIcon name="logout" />
            </button>
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '../auth/AuthProvider';
import { AdminIcon } from '../components/AdminIcon';
import { adminNavigation } from './navigation';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { hasPermission, user } = useAdminAuth();

  return (
    <>
      <button
        className={`admin-sidebar-backdrop ${open ? 'is-open' : ''}`}
        type="button"
        onClick={onClose}
        aria-label="Đóng menu quản trị"
      />
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>Prime Nuts USA</strong>
            <small>Prime Nuts CMS</small>
          </span>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Quản trị">
          {adminNavigation.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.permission || hasPermission(item.permission),
            );
            if (visibleItems.length === 0) return null;

            return (
              <div className="admin-nav-group" key={group.label}>
                <p>{group.label}</p>
                {visibleItems.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      className={active ? 'is-active' : undefined}
                      href={item.href}
                      key={item.href}
                      onClick={onClose}
                    >
                      <AdminIcon name={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="admin-sidebar-account">
          <span className="admin-avatar">
            {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
          </span>
          <span>
            <strong>{user?.name || 'Quản trị viên'}</strong>
            <small>{user?.role?.name || user?.email}</small>
          </span>
        </div>
      </aside>
    </>
  );
}

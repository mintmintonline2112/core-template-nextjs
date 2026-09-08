'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, FileText, Mail, Megaphone } from 'lucide-react';
import { adminApi } from '@/app/admin/_lib/admin-api';
import { cn } from '@/app/admin/_lib/utils';
import type { PaginatedResponse } from '@/app/admin/_lib/pagination';

interface AppNotification {
  id: number;
  type: string;
  module: string;
  title: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  createdAt: string;
}

const NOTIFICATIONS_QUERY_KEY = ['admin', 'notifications'];

const MODULE_LINKS: Record<string, string> = {
  contact: '/admin/contacts',
  contacts: '/admin/contacts',
  admincontact: '/admin/contacts',
  blogposts: '/admin/blog-posts',
  pages: '/admin/pages',
};

const MODULE_ICONS: Record<string, React.ReactNode> = {
  contact: <Mail size={15} />,
  contacts: <Mail size={15} />,
  admincontact: <Mail size={15} />,
  blogposts: <FileText size={15} />,
  pages: <FileText size={15} />,
};

function timeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function NotificationsBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () =>
      adminApi.get<PaginatedResponse<AppNotification>>(
        `admin/notifications?page=1&limit=20&orderBy=${encodeURIComponent(
          JSON.stringify([{ createdAt: 'DESC' }]),
        )}`,
      ),
    refetchInterval: 60_000,
  });

  const items = data?.data ?? [];
  const unread = items.filter((n) => !n.is_read);

  async function markAllRead() {
    if (unread.length === 0) return;
    try {
      await adminApi.patch('admin/notifications/mark-as-read', {
        ids: unread.map((n) => n.id),
      });
      await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    } catch {
    }
  }

  async function openItem(n: AppNotification) {
    setOpen(false);
    if (!n.is_read) {
      try {
        await adminApi.patch('admin/notifications/mark-as-read', { ids: [n.id] });
        await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      } catch {
      }
    }
    const link =
      (n.metadata?.link as string | undefined) ??
      MODULE_LINKS[n.module?.toLowerCase?.() ?? ''] ??
      '/admin/dashboard';
    router.push(link);
  }

  return (
    <div className="ntf">
      <button
        type="button"
        className="ntf-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Thông báo"
      >
        <Bell size={18} />
        {unread.length > 0 && (
          <span className="ntf-badge">{unread.length > 9 ? '9+' : unread.length}</span>
        )}
      </button>

      {open && (
        <>
          <div className="ntf-overlay" onClick={() => setOpen(false)} />
          <div className="ntf-pop">
            <div className="ntf-head">
              <span>Thông báo</span>
              {unread.length > 0 && (
                <button type="button" className="ntf-clear" onClick={markAllRead}>
                  <CheckCheck size={13} /> Đánh dấu đã đọc
                </button>
              )}
            </div>
            <div className="ntf-list">
              {items.length === 0 ? (
                <p className="ntf-empty">Chưa có thông báo nào</p>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={cn('ntf-item', !n.is_read && 'is-unread')}
                    onClick={() => openItem(n)}
                  >
                    <span className="ntf-icon">
                      {MODULE_ICONS[n.module?.toLowerCase?.() ?? ''] ?? <Megaphone size={15} />}
                    </span>
                    <span className="ntf-body">
                      <span className="ntf-title">{n.title}</span>
                      {n.message && <span className="ntf-msg">{n.message}</span>}
                    </span>
                    <span className="ntf-time">{timeLabel(n.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/admin/core/admin-api';
import { useAdminAuth } from '@/admin/auth/AuthProvider';
import { AdminIcon } from '@/admin/components/AdminIcon';
import { PurgeCacheButton } from './PurgeCacheButton';
import type { DashboardSummary } from './types';

const numberFormatter = new Intl.NumberFormat('vi-VN');
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    published: 'Đã xuất bản',
    draft: 'Bản nháp',
    archived: 'Lưu trữ',
  };
  return (
    <span className={`admin-status is-${status}`}>
      {labels[status] ?? status}
    </span>
  );
}

export function DashboardScreen() {
  const { user, hasPermission } = useAdminAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSummary(await adminApi.get<DashboardSummary>('/admin/dashboard/summary'));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const stats = summary
    ? [
        {
          label: 'Bài viết',
          value: summary.content.blogPosts,
          note: `${summary.content.publishedBlogPosts} đã xuất bản`,
          icon: 'article' as const,
        },
        {
          label: 'Trang nội dung',
          value: summary.content.pages,
          note: `${summary.content.sections} section`,
          icon: 'page' as const,
        },
        {
          label: 'Liên hệ',
          value: summary.contacts.total,
          note: `+${summary.contacts.thisMonth} trong tháng`,
          icon: 'contact' as const,
        },
        {
          label: 'Nhân sự',
          value: summary.staff.total,
          note: `${summary.staff.active} đang hoạt động`,
          icon: 'staff' as const,
        },
      ]
    : [];

  return (
    <div className="admin-dashboard">
      <section className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Tổng quan hệ thống</p>
          <h1>Chào {user?.name || 'bạn'},</h1>
          <p>Theo dõi nội dung website và các yêu cầu mới từ khách hàng.</p>
        </div>
        <div className="admin-heading-actions">
          <PurgeCacheButton />
          <button className="admin-secondary-button" onClick={loadSummary} disabled={loading}>
            <AdminIcon name="refresh" />
            {loading ? 'Đang tải' : 'Làm mới'}
          </button>
        </div>
      </section>

      {error ? (
        <div className="admin-error-state" role="alert">
          <strong>Chưa thể tải dashboard</strong>
          <p>{error}</p>
          <button type="button" onClick={loadSummary}>Thử lại</button>
        </div>
      ) : null}

      <section className="admin-stat-grid" aria-label="Thống kê tổng quan">
        {loading && !summary
          ? Array.from({ length: 4 }, (_, index) => (
              <div className="admin-stat-card is-loading" key={index} />
            ))
          : stats.map((stat) => (
              <article className="admin-stat-card" key={stat.label}>
                <span className="admin-stat-icon"><AdminIcon name={stat.icon} /></span>
                <div>
                  <p>{stat.label}</p>
                  <strong>{numberFormatter.format(stat.value)}</strong>
                  <small>{stat.note}</small>
                </div>
              </article>
            ))}
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-panel-wide">
          <header className="admin-panel-header">
            <div>
              <h2>Bài viết cập nhật gần đây</h2>
              <p>{summary?.content.draftBlogPosts ?? 0} bản nháp đang chờ hoàn thiện</p>
            </div>
            {hasPermission('BLOG_POST_LIST') ? <Link href="/admin/blog-posts">Xem tất cả</Link> : null}
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Tiêu đề</th><th>Trạng thái</th><th>Cập nhật</th></tr></thead>
              <tbody>
                {summary?.recentPosts.length ? summary.recentPosts.map((post) => (
                  <tr key={post.id}>
                    <td><strong>{post.title}</strong><small>/{post.slug}</small></td>
                    <td><StatusBadge status={post.status} /></td>
                    <td>{dateFormatter.format(new Date(post.updatedAt))}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="admin-empty-cell">Chưa có bài viết.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-panel">
          <header className="admin-panel-header">
            <div><h2>Truy cập nhanh</h2><p>Các tác vụ nội dung thường dùng</p></div>
          </header>
          <div className="admin-quick-links">
            {hasPermission('BLOG_POST_LIST') ? <Link href="/admin/blog-posts"><AdminIcon name="article" /><span><strong>Quản lý bài viết</strong><small>{summary?.content.blogPosts ?? 0} nội dung</small></span><AdminIcon name="chevron" /></Link> : null}
            {hasPermission('PAGE_LIST') ? <Link href="/admin/pages"><AdminIcon name="page" /><span><strong>Quản lý trang</strong><small>{summary?.content.publishedPages ?? 0} đang hiển thị</small></span><AdminIcon name="chevron" /></Link> : null}
            {hasPermission('CONTACT_LIST') ? <Link href="/admin/contacts"><AdminIcon name="contact" /><span><strong>Liên hệ khách hàng</strong><small>{summary?.contacts.thisMonth ?? 0} trong tháng</small></span><AdminIcon name="chevron" /></Link> : null}
          </div>
        </section>

        <section className="admin-panel admin-panel-full">
          <header className="admin-panel-header">
            <div><h2>Liên hệ mới nhất</h2><p>Yêu cầu gửi từ biểu mẫu trên website</p></div>
            {hasPermission('CONTACT_LIST') ? <Link href="/admin/contacts">Xem tất cả</Link> : null}
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Khách hàng</th><th>Chủ đề</th><th>Ngày gửi</th></tr></thead>
              <tbody>
                {summary?.recentContacts.length ? summary.recentContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td><strong>{contact.fullname || 'Chưa cung cấp tên'}</strong><small>{contact.email || 'Không có email'}</small></td>
                    <td>{contact.subject || 'Liên hệ từ website'}</td>
                    <td>{dateFormatter.format(new Date(contact.createdAt))}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="admin-empty-cell">Chưa có liên hệ nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

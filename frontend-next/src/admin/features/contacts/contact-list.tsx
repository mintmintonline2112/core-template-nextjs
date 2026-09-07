'use client';

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Mail } from 'lucide-react';
import { DataTable } from '@/admin/components/data-table/data-table';
import type { TableColumn, TableActionEvent } from '@/admin/components/data-table/types';
import { confirmAction } from '@/admin/lib/confirm';
import { formatDate } from '@/admin/lib/cms-shared';
import { contactService, CONTACT_QUERY_KEY, type Contact } from './contact.service';

function replyMailto(contact: Contact): string {
  const subject = encodeURIComponent(`Re: ${contact.subject ?? 'Liên hệ từ website'}`);
  return `mailto:${contact.email}?subject=${subject}`;
}

export function ContactList() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Contact | null>(null);

  const columns: TableColumn<Contact>[] = useMemo(
    () => [
      {
        key: 'fullname',
        label: 'Khách hàng',
        type: 'custom',
        align: 'left',
        render: (row) => (
          <button type="button" className="dt-link dt-link-button" onClick={() => setSelected(row)}>
            {row.fullname}
          </button>
        ),
      },
      { key: 'email', label: 'Email', type: 'text', align: 'left' },
      { key: 'phone', label: 'Điện thoại', type: 'text', align: 'left' },
      { key: 'subject', label: 'Chủ đề', type: 'text', align: 'left' },
      {
        key: 'createdAt',
        label: 'Ngày gửi',
        type: 'custom',
        align: 'center',
        render: (row) => formatDate(row.createdAt),
      },
      { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
    ],
    [],
  );

  async function handleAction(event: TableActionEvent<Contact>) {
    const item = event.item;
    switch (event.action) {
      case 'reply':
        if (item) window.open(replyMailto(item), '_blank');
        break;
      case 'delete':
        if (item?.id) {
          await confirmAction(
            {
              title: 'Xóa liên hệ?',
              text: `Yêu cầu của "${item.fullname}" sẽ bị xóa vĩnh viễn.`,
              confirmButtonText: 'Xóa',
            },
            () => contactService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <>
      <DataTable<Contact>
        title="Liên hệ khách hàng"
        subtitle="Yêu cầu gửi từ form liên hệ trên website"
        queryKey={[...CONTACT_QUERY_KEY]}
        columns={columns}
        fetcher={(params) => contactService.paginate(params)}
        showAdd={false}
        searchPlaceholder="Tìm tên, email, số điện thoại…"
        enabledActions={['reply', 'delete']}
        onAction={handleAction}
      />

      {selected && (
        <div className="lb-overlay" onClick={() => setSelected(null)}>
          <div className="ct-detail" onClick={(e) => e.stopPropagation()}>
            <div className="lb-detail-head">
              <h3>{selected.fullname}</h3>
              <button type="button" onClick={() => setSelected(null)} aria-label="Đóng">
                <X size={18} />
              </button>
            </div>
            <dl className="lb-detail-rows">
              <div className="lb-detail-row">
                <dt>Email</dt>
                <dd>{selected.email}</dd>
              </div>
              <div className="lb-detail-row">
                <dt>Điện thoại</dt>
                <dd>{selected.phone || '—'}</dd>
              </div>
              <div className="lb-detail-row">
                <dt>Chủ đề</dt>
                <dd>{selected.subject || '—'}</dd>
              </div>
              <div className="lb-detail-row">
                <dt>Ngày gửi</dt>
                <dd>{formatDate(selected.createdAt)}</dd>
              </div>
              <div>
                <dt>Nội dung</dt>
                <p className="ct-message">{selected.message}</p>
              </div>
            </dl>
            <div className="lb-detail-actions">
              <a href={replyMailto(selected)} className="adm-btn adm-btn--primary">
                <Mail size={15} /> Trả lời qua email
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import './ui.css';

/*
 * Client Component DUY NHẤT trong bộ ui mẫu: cần useEffect + DOM API của <dialog>.
 * Đây là ví dụ cho nguyên tắc "đẩy 'use client' xuống lá": chỉ Modal là client,
 * còn Button/Card/Badge bên trong vẫn có thể là Server Component khi được truyền
 * vào qua children.
 *
 *   const [open, setOpen] = useState(false);
 *   <Modal open={open} onClose={() => setOpen(false)} title="Xoá bài viết?"
 *          footer={<><Button variant="ghost" onClick=…>Huỷ</Button><Button variant="danger">Xoá</Button></>}>
 *     Hành động này không thể hoàn tác.
 *   </Modal>
 */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  /** Chiều rộng tối đa, ví dụ '40rem'. Mặc định 32rem. */
  width?: string;
  className?: string;
  children?: ReactNode;
}

export function Modal({ open, onClose, title, footer, width, className, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Đồng bộ prop `open` với trạng thái thật của <dialog> (showModal/close).
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Đóng khi bấm Escape hoặc bấm ra ngoài (backdrop).
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) onClose();
    };
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('click', onClick);
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('click', onClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={cn('ui-modal', className)}
      style={width ? ({ '--ui-modal-width': width } as React.CSSProperties) : undefined}
    >
      {title ? (
        <div className="ui-modal__header">
          <h2 className="ui-modal__title">{title}</h2>
          <button type="button" className="ui-modal__close" aria-label="Đóng" onClick={onClose}>
            ×
          </button>
        </div>
      ) : null}
      <div className="ui-modal__body">{children}</div>
      {footer ? <div className="ui-modal__footer">{footer}</div> : null}
    </dialog>
  );
}

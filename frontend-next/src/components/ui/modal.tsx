"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/utils/cn";

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

export function Modal({
  open,
  onClose,
  title,
  footer,
  width,
  className,
  children,
}: ModalProps) {
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
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("click", onClick);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("click", onClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={cn(
        "w-[min(92vw,var(--ui-modal-width,32rem))] rounded-2xl border-none bg-paper p-0 text-ink shadow-float backdrop:bg-navy-900/45",
        className,
      )}
      style={
        width
          ? ({ "--ui-modal-width": width } as React.CSSProperties)
          : undefined
      }
    >
      {title ? (
        <div className="flex items-center justify-between border-b border-b-line-soft px-5 py-4">
          <h2 className="m-0 text-lg font-bold">{title}</h2>
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent text-2xl leading-none text-ink-faint"
            aria-label="Đóng"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      ) : null}
      <div className="p-5">{children}</div>
      {footer ? (
        <div className="flex justify-end gap-2 border-t border-t-line-soft px-5 py-4">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}

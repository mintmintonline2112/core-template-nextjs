import { cn } from '@/utils/cn';
import './ui.css';

/** Vòng xoay loading, kế thừa màu chữ hiện tại (currentColor). Server Component. */
export function Spinner({ className, label = 'Đang tải' }: { className?: string; label?: string }) {
  return <span className={cn('ui-spinner', className)} role="status" aria-label={label} />;
}

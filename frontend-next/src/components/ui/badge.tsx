import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import './ui.css';

export type BadgeTone = 'green' | 'gold' | 'neutral' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** Nhãn trạng thái nhỏ (Server Component). Ví dụ: <Badge tone="gold">Draft</Badge> */
export function Badge({ tone = 'green', className, ...rest }: BadgeProps) {
  return <span className={cn('ui-badge', tone !== 'green' && `ui-badge--${tone}`, className)} {...rest} />;
}

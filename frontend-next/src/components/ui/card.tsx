import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import './ui.css';

/*
 * Card ghép từ các phần nhỏ (compound component), tất cả là Server Component:
 *
 *   <Card>
 *     <CardHeader title="Bài viết mới" action={<Button size="sm">Xem tất cả</Button>} />
 *     <CardBody>…</CardBody>
 *     <CardFooter>…</CardFooter>
 *   </Card>
 */

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('ui-card', className)} {...rest} />;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  /** Nút / link ở góc phải header. */
  action?: ReactNode;
}

export function CardHeader({ title, action, className, children, ...rest }: CardHeaderProps) {
  return (
    <div className={cn('ui-card__header', className)} {...rest}>
      {title ? <h3 className="ui-card__title">{title}</h3> : children}
      {action}
    </div>
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('ui-card__body', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('ui-card__footer', className)} {...rest} />;
}

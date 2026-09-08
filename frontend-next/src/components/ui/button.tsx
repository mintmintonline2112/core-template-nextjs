import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from './spinner';
import './ui.css';

/*
 * Server Component: không dùng hook nên KHÔNG có 'use client'.
 * Vẫn nhận onClick — khi được render bên trong một Client Component thì
 * handler chạy bình thường; còn trong Server Component chỉ dùng href/type=submit.
 */

export type ButtonVariant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  /** Icon đứng trước nội dung (ví dụ <AdminIcon name="plus" />). */
  leading?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export type ButtonProps = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    /** Có href → render <Link> với style nút, thay vì <button>. */
    href?: string;
  };

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  loading,
  leading,
  className,
  children,
  href,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = cn(
    'ui-btn',
    variant !== 'primary' && `ui-btn--${variant}`,
    size !== 'md' && `ui-btn--${size}`,
    block && 'ui-btn--block',
    className,
  );
  const content = (
    <>
      {loading ? <Spinner /> : leading}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled || loading || undefined}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Spinner } from "./spinner";

/*
 * Server Component: không dùng hook nên KHÔNG có 'use client'.
 * Vẫn nhận onClick — khi được render bên trong một Client Component thì
 * handler chạy bình thường; còn trong Server Component chỉ dùng href/type=submit.
 */

export type ButtonVariant = "primary" | "gold" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "border-navy-700 bg-navy-700 text-white",
  gold: "border-gold-400 bg-gold-400 text-navy-900",
  outline: "border-navy-700 bg-transparent text-navy-700",
  ghost: "border-transparent bg-transparent text-ink",
  danger: "border-danger bg-danger text-white",
};

/** `md` giữ cỡ chữ của chỗ đặt nút (thẻ <button> mặc định không kế thừa). */
const SIZE: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm leading-none",
  md: "px-6 py-3 [font-size:inherit] leading-none",
  lg: "px-8 py-4 text-base leading-none",
};

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
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    /** Có href → render <Link> với style nút, thay vì <button>. */
    href?: string;
  };

export function Button({
  variant = "primary",
  size = "md",
  block,
  loading,
  leading,
  className,
  children,
  href,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border font-semibold no-underline [transition:background_0.15s_ease,color_0.15s_ease,transform_0.1s_ease] hover:brightness-108 active:[transform:translateY(1px)] disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55",
    VARIANT[variant],
    SIZE[size],
    block && "w-full",
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
      <Link
        href={href}
        className={classes}
        aria-disabled={disabled || loading || undefined}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {content}
    </button>
  );
}

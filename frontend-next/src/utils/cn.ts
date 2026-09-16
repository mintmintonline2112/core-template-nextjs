import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Ghép className có điều kiện: cn('ui-btn', active && 'is-active', props.className).
 * Dùng twMerge để giải xung đột giữa các utility Tailwind trùng nhóm (VD hai
 * class `px-2` và `px-4` cùng truyền vào) — class đứng SAU thắng, đúng như bạn
 * mong đợi khi override style qua props.className.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

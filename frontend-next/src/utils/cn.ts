import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge phải biết các mốc tự đặt trong styles/tailwind.css, nếu không
 * nó đoán sai nhóm: `text-h2` bị coi là MÀU chữ nên `cn('text-h2', 'text-light')`
 * xoá mất cỡ chữ. Thêm/đổi tên mốc trong @theme thì sửa cả danh sách này.
 */
const twMerge = extendTailwindMerge({
  // Mặc định tailwind-merge coi text-* (cỡ chữ) xung đột với leading-* vì thang
  // gốc của Tailwind gắn sẵn line-height. Thang của site thì KHÔNG, nên bỏ xung
  // đột đó — không thì `cn('leading-none', 'text-sm')` lặng lẽ mất leading.
  override: { conflictingClassGroups: { "font-size": [] } },
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "h4", "h5"],
      tracking: ["xs", "sm", "md", "lg", "xl", "2xl"],
      shadow: ["soft", "lift", "badge", "float", "glow", "glow-lg"],
      ease: ["brand"],
    },
  },
});

/**
 * Ghép className có điều kiện: cn('rounded border', active && 'border-gold-400', props.className).
 * Dùng twMerge để giải xung đột giữa các utility Tailwind trùng nhóm (VD hai
 * class `px-2` và `px-4` cùng truyền vào) — class đứng SAU thắng, đúng như bạn
 * mong đợi khi override style qua props.className.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

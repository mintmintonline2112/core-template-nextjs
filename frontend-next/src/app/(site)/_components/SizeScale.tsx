import type { CSSProperties } from "react";

/**
 * Thước đo cỡ hạt: panel xanh đậm, mỗi cỡ là một hạt hạnh nhân vàng nhỏ dần
 * theo đúng nghĩa (18/20 = hạt to nhất → 32/34 = nhỏ nhất), số đặt trên vạch
 * chia như thước đo nông sản. Dùng chung cho trang chủ, /products và section
 * kernel-sizes tạo từ CMS.
 */
export function SizeScale({ sizes, note }: { sizes: string[]; note?: string }) {
  const max = Math.max(sizes.length - 1, 1);
  return (
    <div className="size-scale">
      <ol className="size-scale-row">
        {sizes.map((size, index) => (
          <li
            key={size}
            style={{ "--k": String(1 - (index / max) * 0.55) } as CSSProperties}
          >
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M16 3 C 22 9 26 16 24 22 C 22.5 27 9.5 27 8 22 C 6 16 10 9 16 3 Z" />
              <path d="M16 8 C 19 12 20.6 15.8 19.7 19.5" strokeWidth="1" />
            </svg>
            <span className="size-scale-num">{size}</span>
            <span className="size-scale-cap">kernels / oz</span>
          </li>
        ))}
      </ol>
      <p className="size-scale-note">{note ?? "Custom sizes & grades on request"}</p>
    </div>
  );
}

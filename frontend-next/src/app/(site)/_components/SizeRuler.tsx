import type { CSSProperties } from "react";

/** Nền panel: quầng sáng navy-600 mờ góc trên phải chồng lên dốc navy-800 → navy-900. */
const PANEL_BG =
  "bg-[radial-gradient(120%_100%_at_80%_0%,rgba(37,55,94,0.5)_0%,rgba(20,31,56,0)_55%),linear-gradient(160deg,var(--navy-800)_0%,var(--navy-900)_100%)]";

/**
 * Thước đo cỡ hạt: panel xanh đậm, mỗi cỡ là một hạt hạnh nhân vàng nhỏ dần
 * theo đúng nghĩa (18/20 = hạt to nhất → 32/34 = nhỏ nhất), số đặt trên vạch
 * chia như thước đo nông sản. Widget của section `size-scale` (SizeScale.tsx).
 *
 * Đã chuyển sang Tailwind, khối `.size-scale*` đã xoá khỏi site.css. Biến `--k`
 * (hệ số thu nhỏ hạt, 1 → 0.45) vẫn đặt bằng inline style vì giá trị tính theo
 * vị trí từng mục; class Tailwind chỉ đọc lại qua calc().
 *
 * Dưới 760px: hàng xuống dòng, căn giữa và bỏ đường chuẩn + vạch chia (xếp
 * nhiều hàng thì vạch chia không còn nghĩa "thước đo" nữa).
 */
export function SizeRuler({ sizes, note }: { sizes: string[]; note?: string }) {
  const max = Math.max(sizes.length - 1, 1);
  return (
    <div
      className={`${PANEL_BG} rounded-lg px-[clamp(1.2rem,3vw,2.4rem)] pt-[clamp(1.8rem,4vw,2.6rem)] pb-[1.3rem] shadow-lift`}
    >
      <ol className="flex items-end justify-between gap-[0.6rem] border-b border-[rgba(217,180,95,0.4)] max-[760px]:flex-wrap max-[760px]:justify-center max-[760px]:gap-x-[1.8rem] max-[760px]:gap-y-[1.2rem] max-[760px]:border-b-0">
        {sizes.map((size, index) => (
          <li
            key={size}
            className='flex min-w-0 flex-col items-center gap-[0.55rem] after:mt-[0.5rem] after:h-[10px] after:w-px after:bg-[rgba(217,180,95,0.7)] after:content-[""] max-[760px]:after:hidden'
            style={{ "--k": String(1 - (index / max) * 0.55) } as CSSProperties}
          >
            <svg
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden="true"
              className="h-auto w-[calc(clamp(38px,4.4vw,66px)*var(--k,1))] text-gold-300"
            >
              <path d="M16 3 C 22 9 26 16 24 22 C 22.5 27 9.5 27 8 22 C 6 16 10 9 16 3 Z" />
              <path d="M16 8 C 19 12 20.6 15.8 19.7 19.5" strokeWidth="1" />
            </svg>
            <span className="font-display text-[clamp(1.05rem,1.6vw,1.45rem)] leading-none font-semibold text-light">
              {size}
            </span>
            <span className="text-[0.6rem] tracking-[0.14em] whitespace-nowrap text-light-soft uppercase">
              kernels / oz
            </span>
          </li>
        ))}
      </ol>
      {note ? (
        <p className="mt-[1.1rem]! mb-0! text-center font-display text-[0.98rem] text-gold-300 italic">
          {note}
        </p>
      ) : null}
    </div>
  );
}

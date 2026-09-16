"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";
import { WorldMapPanel } from "./WorldMap";

export type RegionEntry = { key: string; label: string; countries: string[] };

/**
 * Phần tương tác của section `about-map` bố cục regions (dùng trong sections/AboutMap.tsx):
 * danh sách khu vực bên trái — bấm một khu vực để mở danh sách nước — và bản đồ
 * bên phải sáng đúng khu vực đang chọn (ghim + đường hàng hải).
 *
 * Đã chuyển sang Tailwind, khối `.amr-*` đã xoá khỏi site.css; chỉ còn
 * `@keyframes amr-in` (Tailwind chỉ gọi được tên animation). Khu vực đang chọn
 * KHÔNG dùng `hover:` — trong CSS cũ rule `.amr-item.is-active .amr-trigger`
 * thắng `.amr-trigger:hover` nhờ độ ưu tiên, nên ở đây chỉ gắn hover cho mục
 * chưa chọn để giữ đúng hành vi.
 */
export function AboutMapRegionsClient({ regions }: { regions: RegionEntry[] }) {
  const [active, setActive] = useState<string | null>(regions[0]?.key ?? null);

  return (
    <div className="reveal grid grid-cols-[minmax(0,0.78fr)_minmax(0,1.72fr)] items-start gap-[clamp(1.5rem,3vw,2.5rem)] max-[900px]:grid-cols-1">
      <ul
        className="flex flex-col border-t border-line"
        aria-label="Export regions"
      >
        {regions.map((region) => {
          const isActive = region.key === active;
          const panelId = `amr-countries-${region.key}`;
          return (
            <li key={region.key} className="border-b border-line">
              <button
                type="button"
                className={cn(
                  "grid min-h-[56px] w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto_18px] items-center gap-[0.8rem] rounded border-0 bg-transparent px-[0.95rem] py-[0.85rem] text-left font-display text-[1.08rem] font-semibold text-ink transition-[background-color,color] duration-200 ease-brand",
                  isActive ? "bg-navy-700 text-light" : "hover:bg-navy-50",
                )}
                aria-expanded={isActive}
                aria-controls={panelId}
                onClick={() => setActive(region.key)}
                onFocus={() => setActive(region.key)}
              >
                <span>{region.label}</span>
                <span
                  className={cn(
                    "font-main text-[0.82rem] font-medium tracking-[0.06em]",
                    isActive ? "text-gold-300" : "text-ink-faint",
                  )}
                >
                  {region.countries.length}{" "}
                  {region.countries.length === 1 ? "market" : "markets"}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={cn(
                    "h-[18px] w-[18px] transition-[transform,color] duration-250 ease-brand",
                    isActive ? "rotate-90 text-gold-300" : "text-ink-faint",
                  )}
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
              {isActive && region.countries.length > 0 ? (
                <ul
                  className="flex animate-[amr-in_350ms_var(--ease)_both] flex-wrap gap-[0.4rem] px-[0.95rem] pt-[0.9rem] pb-[1.1rem] motion-reduce:animate-none"
                  id={panelId}
                >
                  {region.countries.map((country) => (
                    <li
                      key={country}
                      className="rounded-[100px] border border-line bg-paper px-[0.7rem] py-[0.25rem] text-[0.88rem] text-ink-soft"
                    >
                      {country}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="max-[900px]:order-[-1]">
        <WorldMapPanel active={active} className="mb-[0.8rem]" />
        <p className="m-0 text-right text-[0.95rem] text-ink-faint italic max-[900px]:text-left">
          Additional destinations on request.
        </p>
      </div>
    </div>
  );
}

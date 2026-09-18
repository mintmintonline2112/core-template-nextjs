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
 * Khu vực đang chọn KHÔNG nhận `hover:` (chỉ gắn hover cho mục chưa chọn) —
 * giữ đúng hành vi cũ: màu mục đang chọn không đổi khi rê chuột.
 */
export function AboutMapRegionsClient({ regions }: { regions: RegionEntry[] }) {
  const [active, setActive] = useState<string | null>(regions[0]?.key ?? null);

  return (
    <div className="reveal grid grid-cols-[minmax(0,0.78fr)_minmax(0,1.72fr)] items-start gap-[clamp(1.5rem,3vw,2.5rem)] max-[900px]:grid-cols-1">
      <ul
        className="flex flex-col border-t border-line"
        aria-label="Khu vực xuất khẩu"
      >
        {regions.map((region) => {
          const isActive = region.key === active;
          const panelId = `amr-countries-${region.key}`;
          return (
            <li key={region.key} className="border-b border-line">
              <button
                type="button"
                className={cn(
                  "grid min-h-[56px] w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto_18px] items-center gap-3 rounded border-0 bg-transparent px-4 py-3 text-left font-display text-lg font-semibold text-ink transition-[background-color,color] duration-200 ease-brand",
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
                    "font-main text-xs font-medium tracking-sm",
                    isActive ? "text-gold-300" : "text-ink-faint",
                  )}
                >
                  {region.countries.length} thị trường
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
                  className="flex animate-[amr-in_350ms_var(--ease)_both] flex-wrap gap-2 px-4 pt-4 pb-4 motion-reduce:animate-none"
                  id={panelId}
                >
                  {region.countries.map((country) => (
                    <li
                      key={country}
                      className="rounded-full border border-line bg-paper px-3 py-1 text-sm text-ink-soft"
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
        <WorldMapPanel active={active} className="mb-3" />
        <p className="m-0 text-right text-base text-ink-faint italic max-[900px]:text-left">
          Những điểm đến khác vui lòng liên hệ.
        </p>
      </div>
    </div>
  );
}

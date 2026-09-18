"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";
import {
  DEFAULT_MAP_REGIONS,
  HUBS,
  MARKETS,
  ORIGIN,
  type MapRegion,
} from "@/config/markets";

/**
 * Bản đồ thị trường tương tác (connection map): ghim theo kinh/vĩ độ trên nền
 * equirectangular, đường hàng hải từ California, spotlight theo khu vực.
 * Dữ liệu thị trường nằm ở src/config/markets.ts.
 *
 * Keyframes `arc-flow`, `pin-pulse` ở styles/effects.css.
 *
 * Hiệu ứng "làm mờ hết, chỉ sáng khu vực đang trỏ" trước đây làm bằng CSS
 * (`.world-panel.hl .map-pin` / `.hot`); giờ tính thẳng trong JS vì `active`
 * đã có sẵn ở đây — đỡ một tầng class trạng thái.
 */

export type { MapRegion };

/** Equirectangular: kinh/vĩ độ → % trên bản đồ 800×400. */
function project(pt: { lat: number; lon: number }) {
  return { x: ((pt.lon + 180) / 360) * 100, y: ((90 - pt.lat) / 180) * 100 };
}

function arcPath(region: string): string {
  const o = project(ORIGIN);
  const h = project(HUBS[region]);
  const x1 = o.x * 8;
  const y1 = o.y * 4;
  const x2 = h.x * 8;
  const y2 = h.y * 4;
  const mx = (x1 + x2) / 2;
  const my = Math.max(8, Math.min(y1, y2) - Math.abs(x2 - x1) * 0.18 - 20);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

/** Chấm ghim + nhãn tên hiện khi rê chuột (nhãn lấy từ thuộc tính data-name). */
const PIN_BASE =
  "pointer-events-auto absolute -mt-[5px] -ml-[5px] h-[10px] w-[10px] cursor-pointer rounded-full bg-gold-300 shadow-glow ring-3 ring-gold-300/20 transition-[transform,opacity,box-shadow] duration-250 ease-brand hover:z-4 hover:scale-150 max-[640px]:-mt-[4px] max-[640px]:-ml-[4px] max-[640px]:h-2 max-[640px]:w-2";

const PIN_LABEL =
  "after:pointer-events-none after:absolute after:bottom-[calc(100%_+_9px)] after:left-1/2 after:z-5 after:-translate-x-1/2 after:translate-y-[4px] after:rounded-sm after:border after:border-gold-300/50 after:bg-navy-900 after:px-3 after:py-1 after:text-xs after:tracking-sm after:whitespace-nowrap after:text-light after:opacity-0 after:transition-[opacity,transform] after:duration-200 after:ease-brand after:content-[attr(data-name)] hover:after:translate-y-0 hover:after:opacity-100 max-[640px]:after:text-2xs";

/** Ghim gốc California: to hơn, có vòng sóng lan và nhãn hiện sẵn. */
const PIN_ORIGIN =
  'h-[14px] w-[14px] -mt-[7px] -ml-[7px] before:absolute before:-inset-[6px] before:animate-[pin-pulse_2.2s_ease-out_infinite] before:rounded-full before:border-[1.5px] before:border-gold-300 before:content-[""] after:translate-y-0 after:opacity-100 motion-reduce:before:animate-none max-[640px]:-mt-[5.5px] max-[640px]:-ml-[5.5px] max-[640px]:h-[11px] max-[640px]:w-[11px]';

/**
 * Khung bản đồ: ảnh nền, đường hàng hải, ghim, chú thích.
 * `active` = key khu vực đang sáng (us/na/ap/sa/me/eu) hoặc null.
 * Dùng trong WorldMap (about-map bố cục pins) và AboutMapRegionsClient (bố cục regions).
 */
export function WorldMapPanel({
  active,
  id,
  className,
}: {
  active: string | null;
  id?: string;
  className?: string;
}) {
  const pinClass = (region: string, origin = false) =>
    cn(
      PIN_BASE,
      PIN_LABEL,
      origin && PIN_ORIGIN,
      // Đang trỏ một khu vực: ghim ngoài khu vực mờ đi, ghim trong khu vực sáng lên
      active &&
        (active === region
          ? "scale-[1.55] opacity-100 shadow-glow-lg ring-4 ring-gold-300/30"
          : "opacity-[0.16]"),
    );
  const origin = project(ORIGIN);

  return (
    <div
      className={cn(
        "reveal relative overflow-hidden rounded-lg border border-gold-300/35 bg-[radial-gradient(110%_90%_at_18%_0%,color-mix(in_oklab,var(--navy-600)_55%,transparent)_0%,transparent_55%),linear-gradient(165deg,var(--navy-800),var(--navy-900))] shadow-lift",
        className ?? "mb-4",
      )}
      id={id}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="block h-auto w-full opacity-[0.92]"
        src="/images/world-map.svg"
        alt="World map showing our export markets"
        width={800}
        height={400}
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 800 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {Object.keys(HUBS).map((region) => (
          <path
            key={region}
            d={arcPath(region)}
            className={cn(
              "animate-[arc-flow_2.6s_linear_infinite] fill-none stroke-gold-300 stroke-[1.3] opacity-45 transition-[opacity,stroke-width] duration-250 ease-brand [stroke-dasharray:5_7] [stroke-linecap:round] motion-reduce:animate-none",
              active &&
                (active === region
                  ? "stroke-[2.2] opacity-95"
                  : "opacity-[0.1]"),
            )}
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {MARKETS.map((pt) => {
          const p = project(pt);
          return (
            <span
              key={pt.n}
              className={pinClass(pt.r)}
              style={{ left: `${p.x.toFixed(2)}%`, top: `${p.y.toFixed(2)}%` }}
              data-name={pt.n}
            />
          );
        })}
        <span
          className={pinClass(ORIGIN.r, true)}
          style={{
            left: `${origin.x.toFixed(2)}%`,
            top: `${origin.y.toFixed(2)}%`,
          }}
          data-name={ORIGIN.n}
        />
      </div>
      <div
        className="absolute bottom-[0.9rem] left-[1.1rem] flex flex-wrap gap-x-5 gap-y-2 rounded-full border border-gold-300/35 bg-navy-900/75 px-4 py-2 text-xs tracking-sm text-light backdrop-blur-[4px] max-[640px]:static max-[640px]:px-4 max-[640px]:pt-3 max-[640px]:pb-4"
        aria-hidden="true"
      >
        <span className="inline-flex items-center gap-2">
          <i className="h-[10px] w-[10px] rounded-full bg-gold-300 shadow-glow outline-[1.5px] outline-offset-2 outline-gold-300/60" />
          California — Origin
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="h-2 w-2 rounded-full bg-gold-300 shadow-glow" />
          Export Markets
        </span>
        <span className="inline-flex items-center gap-2">
          {/* Chỉ viền trên nét đứt: `border-dashed` của Tailwind đổi kiểu cả 4 cạnh
              (thành khung đứt nét), nên khai thẳng shorthand border-top. */}
          <i className="w-6 opacity-85 [border-top:2px_dashed_var(--gold-300)]" />
          Trade Routes
        </span>
      </div>
    </div>
  );
}

export function WorldMap({ regions }: { regions?: MapRegion[] }) {
  // Nhãn chip khu vực từ CMS (regions); ghim trên bản đồ vẫn theo bộ tọa độ
  // tĩnh — key phải thuộc us/na/ap/sa/me/eu thì spotlight mới có ghim.
  const REGIONS = regions && regions.length > 0 ? regions : DEFAULT_MAP_REGIONS;
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <WorldMapPanel active={active} id="world-panel" />

      <div className="reveal mt-6 mb-4 flex flex-wrap justify-center gap-2">
        {REGIONS.map((region) => (
          <button
            key={region.key}
            type="button"
            className={cn(
              "cursor-pointer rounded-full border border-line bg-paper px-5 py-2 text-base font-medium tracking-xs text-ink-soft transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-brand hover:-translate-y-[2px] hover:border-navy-700 hover:bg-navy-700 hover:text-cream hover:shadow-badge",
              active === region.key &&
                "-translate-y-[2px] border-navy-700 bg-navy-700 text-cream shadow-badge",
            )}
            onMouseEnter={() => setActive(region.key)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(region.key)}
            onBlur={() => setActive(null)}
          >
            {region.label}
          </button>
        ))}
      </div>
      <p className="mx-auto my-0 max-w-[46rem] text-center text-base text-ink-faint italic">
        Hover a region — its markets light up. Additional destinations on
        request.
      </p>
    </>
  );
}

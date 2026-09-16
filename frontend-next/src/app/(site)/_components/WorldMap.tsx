"use client";

import { useState } from "react";
import { DEFAULT_MAP_REGIONS, HUBS, MARKETS, ORIGIN, type MapRegion } from "@/config/markets";

/**
 * Bản đồ thị trường tương tác (connection map): ghim theo kinh/vĩ độ trên nền
 * equirectangular, đường hàng hải từ California, spotlight theo khu vực.
 * Dữ liệu thị trường nằm ở src/config/markets.ts.
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

/**
 * Khung bản đồ: ảnh nền, đường hàng hải, ghim, chú thích.
 * `active` = key khu vực đang sáng (us/na/ap/sa/me/eu) hoặc null.
 * Dùng trong WorldMap (about-map bố cục pins) và AboutMapRegionsClient (bố cục regions).
 */
export function WorldMapPanel({ active, id }: { active: string | null; id?: string }) {
  const pinClass = (region: string, origin = false) => {
    let cls = origin ? "map-pin map-pin-origin" : "map-pin";
    if (active && active === region) cls += " hot";
    return cls;
  };
  const origin = project(ORIGIN);

  return (
    <div className={`world-panel reveal${active ? " hl" : ""}`} id={id}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="world-map-img"
        src="/images/world-map.svg"
        alt="World map showing Prime Nuts USA export markets"
        width={800}
        height={400}
      />
      <svg className="world-arcs" viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true">
        {Object.keys(HUBS).map((region) => (
          <path
            key={region}
            d={arcPath(region)}
            className={`world-arc${active === region ? " hot" : ""}`}
          />
        ))}
      </svg>
      <div className="world-pins" aria-hidden="true">
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
          style={{ left: `${origin.x.toFixed(2)}%`, top: `${origin.y.toFixed(2)}%` }}
          data-name={ORIGIN.n}
        />
      </div>
      <div className="world-legend" aria-hidden="true">
        <span>
          <i className="dot dot-origin" />
          California — Origin
        </span>
        <span>
          <i className="dot" />
          Export Markets
        </span>
        <span>
          <i className="dash" />
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

      <div className="region-chips reveal" id="region-chips">
        {REGIONS.map((region) => (
          <button
            key={region.key}
            type="button"
            className={active === region.key ? "active" : undefined}
            onMouseEnter={() => setActive(region.key)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(region.key)}
            onBlur={() => setActive(null)}
          >
            {region.label}
          </button>
        ))}
      </div>
      <p className="world-hint reveal">
        Hover a region — its markets light up. Additional destinations on request.
      </p>
    </>
  );
}

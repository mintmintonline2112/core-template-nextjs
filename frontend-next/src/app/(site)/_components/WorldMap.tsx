"use client";

import { useState } from "react";

/**
 * Bản đồ thị trường tương tác (connection map): ghim theo kinh/vĩ độ trên nền
 * equirectangular, đường hàng hải từ California, spotlight theo khu vực.
 */

type MarketPoint = { r: string; n: string; lat: number; lon: number };

const ORIGIN: MarketPoint = { r: "us", n: "California — Origin", lat: 36.8, lon: -119.8 };

const MARKETS: MarketPoint[] = [
  { r: "us", n: "United States", lat: 39.8, lon: -98.6 },
  { r: "na", n: "Canada", lat: 53.9, lon: -106.3 },
  { r: "na", n: "Mexico", lat: 23.6, lon: -102.5 },
  { r: "ap", n: "Vietnam", lat: 16.2, lon: 106.0 },
  { r: "ap", n: "China", lat: 34.5, lon: 104.0 },
  { r: "ap", n: "Hong Kong", lat: 22.3, lon: 114.2 },
  { r: "ap", n: "Japan", lat: 36.2, lon: 138.3 },
  { r: "ap", n: "South Korea", lat: 36.5, lon: 127.9 },
  { r: "ap", n: "Taiwan", lat: 23.7, lon: 121.0 },
  { r: "ap", n: "Singapore", lat: 1.35, lon: 103.8 },
  { r: "ap", n: "Malaysia", lat: 3.9, lon: 102.0 },
  { r: "ap", n: "Indonesia", lat: -2.5, lon: 117.9 },
  { r: "ap", n: "Thailand", lat: 15.0, lon: 101.0 },
  { r: "ap", n: "Philippines", lat: 12.9, lon: 122.0 },
  { r: "sa", n: "India", lat: 21.0, lon: 78.0 },
  { r: "sa", n: "Pakistan", lat: 29.9, lon: 69.4 },
  { r: "sa", n: "Bangladesh", lat: 23.7, lon: 90.4 },
  { r: "sa", n: "Sri Lanka", lat: 7.9, lon: 80.8 },
  { r: "me", n: "United Arab Emirates", lat: 24.3, lon: 54.4 },
  { r: "me", n: "Saudi Arabia", lat: 23.9, lon: 45.1 },
  { r: "me", n: "Qatar", lat: 25.3, lon: 51.2 },
  { r: "me", n: "Kuwait", lat: 29.3, lon: 47.5 },
  { r: "me", n: "Bahrain", lat: 26.0, lon: 50.5 },
  { r: "me", n: "Oman", lat: 21.5, lon: 57.0 },
  { r: "me", n: "Jordan", lat: 31.3, lon: 36.4 },
  { r: "eu", n: "Germany", lat: 51.1, lon: 10.4 },
  { r: "eu", n: "Netherlands", lat: 52.2, lon: 5.3 },
  { r: "eu", n: "Spain", lat: 40.2, lon: -3.7 },
  { r: "eu", n: "Italy", lat: 42.8, lon: 12.5 },
  { r: "eu", n: "France", lat: 46.6, lon: 2.5 },
  { r: "eu", n: "United Kingdom", lat: 53.0, lon: -1.5 },
];

const HUBS: Record<string, { lat: number; lon: number }> = {
  na: { lat: 23.6, lon: -102.5 },
  ap: { lat: 16.2, lon: 106.0 },
  sa: { lat: 21.0, lon: 78.0 },
  me: { lat: 24.3, lon: 54.4 },
  eu: { lat: 51.1, lon: 10.4 },
};

export type MapRegion = { key: string; label: string };

const DEFAULT_REGIONS: MapRegion[] = [
  { key: "us", label: "United States" },
  { key: "na", label: "North America" },
  { key: "ap", label: "Asia Pacific" },
  { key: "sa", label: "South Asia" },
  { key: "me", label: "Middle East" },
  { key: "eu", label: "Europe" },
];

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

export function WorldMap({ regions }: { regions?: MapRegion[] }) {
  // Nhãn chip khu vực từ CMS (markets.regions); ghim trên bản đồ vẫn theo bộ
  // tọa độ tĩnh — key phải thuộc us/na/ap/sa/me/eu thì spotlight mới có ghim.
  const REGIONS = regions && regions.length > 0 ? regions : DEFAULT_REGIONS;
  const [active, setActive] = useState<string | null>(null);

  const pinClass = (region: string, origin = false) => {
    let cls = origin ? "map-pin map-pin-origin" : "map-pin";
    if (active && active === region) cls += " hot";
    return cls;
  };

  return (
    <>
      <div className={`world-panel reveal${active ? " hl" : ""}`} id="world-panel">
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
          {(() => {
            const p = project(ORIGIN);
            return (
              <span
                className={pinClass(ORIGIN.r, true)}
                style={{ left: `${p.x.toFixed(2)}%`, top: `${p.y.toFixed(2)}%` }}
                data-name={ORIGIN.n}
              />
            );
          })()}
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

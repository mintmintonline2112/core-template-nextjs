"use client";

import { useState } from "react";
import { WorldMapPanel } from "./WorldMap";

export type RegionEntry = { key: string; label: string; countries: string[] };

/**
 * Phần tương tác của section `about-map` bố cục regions (dùng trong sections/AboutMap.tsx):
 * danh sách khu vực bên trái — bấm một khu vực để mở danh sách nước — và bản đồ
 * bên phải sáng đúng khu vực đang chọn (ghim + đường hàng hải).
 */
export function AboutMapRegionsClient({ regions }: { regions: RegionEntry[] }) {
  const [active, setActive] = useState<string | null>(regions[0]?.key ?? null);

  return (
    <div className="amr-layout reveal">
      <ul className="amr-list" aria-label="Export regions">
        {regions.map((region) => {
          const isActive = region.key === active;
          const panelId = `amr-countries-${region.key}`;
          return (
            <li key={region.key} className={`amr-item${isActive ? " is-active" : ""}`}>
              <button
                type="button"
                className="amr-trigger"
                aria-expanded={isActive}
                aria-controls={panelId}
                onClick={() => setActive(region.key)}
                onFocus={() => setActive(region.key)}
              >
                <span className="amr-name">{region.label}</span>
                <span className="amr-count">
                  {region.countries.length} {region.countries.length === 1 ? "market" : "markets"}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
              {isActive && region.countries.length > 0 ? (
                <ul className="amr-countries" id={panelId}>
                  {region.countries.map((country) => (
                    <li key={country}>{country}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="amr-map">
        <WorldMapPanel active={active} />
        <p className="amr-note">Additional destinations on request.</p>
      </div>
    </div>
  );
}

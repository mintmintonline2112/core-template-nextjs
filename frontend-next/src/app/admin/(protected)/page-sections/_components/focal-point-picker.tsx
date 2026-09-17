'use client';

import { useRef, type KeyboardEvent, type PointerEvent } from 'react';

/**
 * Chọn ĐIỂM LẤY NÉT của ảnh (CSS object-position) bằng cách bấm / kéo lên ảnh gốc.
 * Website cắt ảnh theo khung (object-fit: cover) — điểm lấy nét luôn nằm trong
 * phần được giữ lại. Hai khung xem trước cho thấy ảnh bị cắt thế nào ở khung dọc
 * (máy tính) và khung ngang (điện thoại).
 *
 * Giá trị lưu dạng "x% y%" (VD "50% 62%"); rỗng = giữa ảnh.
 * Bàn phím: chấm tròn nhận focus, ←/→/↑/↓ dời 1%, giữ Shift dời 10%.
 */

type Point = { x: number; y: number };

const KEYWORD: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };

/** "50% 62%", "center 62%", "left top"… → {x, y}; không đọc được thì giữa ảnh. */
export function parseObjectPosition(value: string | undefined): Point {
  const parts = (value ?? '').trim().split(/\s+/).filter(Boolean);
  const read = (part: string | undefined) => {
    if (!part) return 50;
    if (part in KEYWORD) return KEYWORD[part];
    const n = Number.parseFloat(part);
    return part.endsWith('%') && Number.isFinite(n) ? n : 50;
  };
  // Một từ khoá dọc đứng trước ("top left") → đảo lại cho đúng trục.
  if (parts[0] === 'top' || parts[0] === 'bottom') return { x: read(parts[1]), y: read(parts[0]) };
  return { x: read(parts[0]), y: read(parts[1]) };
}

const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)));

/** Khung xem trước: kích thước (px) mô phỏng tỉ lệ khung ảnh ngoài website. */
export type FocalPreview = { label: string; width: number; height: number };

const DEFAULT_PREVIEWS: FocalPreview[] = [
  { label: 'Khung dọc (máy tính)', width: 96, height: 164 },
  { label: 'Khung ngang (điện thoại)', width: 176, height: 99 },
];

export function FocalPointPicker({
  url,
  value,
  onChange,
  previews = DEFAULT_PREVIEWS,
}: {
  url: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  previews?: FocalPreview[];
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { x, y } = parseObjectPosition(value);
  const position = `${x}% ${y}%`;

  const setPoint = (point: Point) => {
    const next = { x: clamp(point.x), y: clamp(point.y) };
    onChange(next.x === 50 && next.y === 50 ? undefined : `${next.x}% ${next.y}%`);
  };

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    setPoint({ x: ((e.clientX - box.left) / box.width) * 100, y: ((e.clientY - box.top) / box.height) * 100 });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 10 : 1;
    const moves: Record<string, Point> = {
      ArrowLeft: { x: x - step, y },
      ArrowRight: { x: x + step, y },
      ArrowUp: { x, y: y - step },
      ArrowDown: { x, y: y + step },
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    setPoint(moves[e.key]);
  };

  return (
    <div className="me-focal">
      <div className="me-focal-main">
        <div
          ref={stageRef}
          className="me-focal-stage"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            fromPointer(e);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" draggable={false} />
          <button
            type="button"
            className="me-focal-dot"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`Điểm lấy nét ${x}% ngang, ${y}% dọc — dùng phím mũi tên để dời`}
            onKeyDown={onKeyDown}
          />
        </div>
        <p className="gf-hint">
          Bấm hoặc kéo lên ảnh để chọn phần cần giữ khi ảnh bị cắt vừa khung. Đang chọn: <strong>{position}</strong>
          {value ? (
            <>
              {' · '}
              <button type="button" className="me-focal-reset" onClick={() => onChange(undefined)}>
                Về giữa ảnh
              </button>
            </>
          ) : null}
        </p>
      </div>

      <div className="me-focal-previews" aria-hidden="true">
        {previews.map((preview) => (
          <figure key={preview.label}>
            <div className="me-focal-frame" style={{ width: preview.width, height: preview.height }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" style={{ objectPosition: position }} />
            </div>
            <figcaption>{preview.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

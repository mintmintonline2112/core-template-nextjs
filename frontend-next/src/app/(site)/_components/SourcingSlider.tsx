"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { PHOTO_FRAME, SECTION_PHOTO } from "./ui";

/**
 * Slider ảnh phần California Sourcing: autoplay, mũi tên, chấm, vuốt.
 * Nhận danh sách slide từ CMS (metadata.slides của section `steps`, bố cục slider);
 * không truyền thì dùng bộ ảnh mặc định bên dưới.
 */

export type SourcingSlide = { src: string; alt?: string; caption?: string };

/** Nút mũi tên tròn kính mờ hai bên ảnh. */
const ARROW =
  "absolute top-1/2 z-4 flex h-11 w-11 items-center justify-center rounded-full border border-gold-300/55 bg-navy-900/60 text-gold-300 backdrop-blur-[4px] [transform:translateY(-50%)] [transition:background-color_200ms_var(--ease),transform_200ms_var(--ease),border-color_200ms_var(--ease)] hover:border-gold-300 hover:bg-navy-700 hover:[transform:translateY(-50%)_scale(1.08)] max-[640px]:h-9 max-[640px]:w-9 [&>svg]:h-5 [&>svg]:w-5 max-[640px]:[&>svg]:h-4 max-[640px]:[&>svg]:w-4";

/** Ảnh mẫu của khung — thay bằng ảnh thật trong Admin → Trang → Section. */
export const DEFAULT_SOURCING_SLIDES: SourcingSlide[] = [
  {
    src: "/images/placeholder-wide.svg",
    alt: "Ảnh minh hoạ",
    caption: "Bước một trong quy trình",
  },
  {
    src: "/images/placeholder-wide.svg",
    alt: "Ảnh minh hoạ",
    caption: "Bước hai trong quy trình",
  },
  {
    src: "/images/placeholder-wide.svg",
    alt: "Ảnh minh hoạ",
    caption: "Bước ba trong quy trình",
  },
  {
    src: "/images/placeholder-wide.svg",
    alt: "Ảnh minh hoạ",
    caption: "Bước bốn trong quy trình",
  },
];

export function SourcingSlider({
  slides,
  current: controlledCurrent,
  onChange,
  paused: pausedOutside = false,
}: {
  slides?: SourcingSlide[];
  /** Truyền vào để điều khiển từ ngoài (chuỗi bước bấm được). Bỏ trống thì slider tự giữ trạng thái. */
  current?: number;
  onChange?: (index: number) => void;
  /** Tạm dừng autoplay từ ngoài (ví dụ khi rê chuột lên chuỗi bước). */
  paused?: boolean;
}) {
  const SLIDES = slides && slides.length > 0 ? slides : DEFAULT_SOURCING_SLIDES;
  const [innerCurrent, setInnerCurrent] = useState(0);
  const current = controlledCurrent ?? innerCurrent;
  const [hoverPaused, setHoverPaused] = useState(false);
  const paused = pausedOutside || hoverPaused;
  const swipeStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % SLIDES.length) + SLIDES.length) % SLIDES.length;
      setInnerCurrent(next);
      onChange?.(next);
    },
    [SLIDES.length, onChange],
  );

  // setTimeout (không phải setInterval) để mỗi lần đổi ảnh là đếm lại 5s —
  // bấm chọn bước xong không bị ảnh tự nhảy ngay sau đó.
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => goTo(current + 1), 5000);
    return () => clearTimeout(timer);
  }, [paused, current, goTo]);

  return (
    <div
      className={cn(
        PHOTO_FRAME,
        SECTION_PHOTO,
        "reveal touch-pan-y border-gold-300/40",
      )}
      id="sourcing-slider"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={() => setHoverPaused(false)}
      onPointerDown={(e) => {
        swipeStartX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (swipeStartX.current === null) return;
        const dx = e.clientX - swipeStartX.current;
        if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
        swipeStartX.current = null;
      }}
    >
      <div
        className="flex h-full [transition:transform_650ms_var(--ease)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <figure
            className="relative m-0 h-full flex-[0_0_100%] overflow-hidden"
            key={slide.src}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="[-webkit-user-drag:none]"
              src={slide.src}
              alt={slide.alt ?? slide.caption ?? ""}
              loading="lazy"
              draggable={false}
            />
            {slide.caption ? (
              <figcaption className="absolute bottom-4 left-[1.1rem] z-3 rounded-full border border-gold-300/45 bg-navy-900/80 px-4 py-2 text-sm tracking-xs text-light backdrop-blur-[4px] max-[640px]:bottom-[0.8rem] max-[640px]:left-[0.8rem] max-[640px]:px-3 max-[640px]:py-1 max-[640px]:text-xs">
                {slide.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
      <button
        type="button"
        className={cn(ARROW, "left-[0.9rem]")}
        aria-label="Previous slide"
        onClick={() => goTo(current - 1)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button
        type="button"
        className={cn(ARROW, "right-[0.9rem]")}
        aria-label="Next slide"
        onClick={() => goTo(current + 1)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div
        className="absolute right-[1.2rem] bottom-[1.1rem] z-4 flex gap-2 max-[640px]:right-[0.9rem] max-[640px]:bottom-[0.9rem]"
        aria-label="Slides"
      >
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className={cn(
              "h-[9px] rounded-full border-none p-0 [transition:background-color_250ms_var(--ease),width_250ms_var(--ease)]",
              index === current
                ? "w-[22px] bg-gold-300"
                : "w-[9px] bg-light/40",
            )}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Slider ảnh phần California Sourcing: autoplay, mũi tên, chấm, vuốt.
 * Nhận danh sách slide từ CMS (metadata.slides của section `sourcing`);
 * không truyền thì dùng bộ ảnh mặc định bên dưới.
 */

export type SourcingSlide = { src: string; alt?: string; caption?: string };

const DEFAULT_SLIDES: SourcingSlide[] = [
  { src: "/images/orchard-rows.jpg", alt: "Rows of almond trees in a California orchard near Winton", caption: "Established California orchards" },
  { src: "/images/hero-branch.jpg", alt: "Green almonds ripening on the branch", caption: "New crop ripening on the tree" },
  { src: "/images/green-almond.jpg", alt: "Fresh green almond cut open in an open hand", caption: "Checked by hand in the field" },
  { src: "/images/kernels-study.jpg", alt: "Almonds in shell, cracked open, natural and blanched kernels", caption: "Sized, sorted & graded" },
  { src: "/images/ship-color.webp", alt: "Container ship being loaded at a port terminal", caption: "Export-ready for global markets" },
];

export function SourcingSlider({ slides }: { slides?: SourcingSlide[] }) {
  const SLIDES = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const swipeStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
    },
    [SLIDES.length],
  );

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setCurrent((value) => (value + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="photo-frame photo-frame-dark section-photo slider reveal"
      id="sourcing-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
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
        className="slider-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <figure className="slide" key={slide.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.src} alt={slide.alt ?? slide.caption ?? ""} loading="lazy" draggable={false} />
            {slide.caption ? <figcaption>{slide.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
      <button
        type="button"
        className="slider-btn slider-prev"
        aria-label="Previous slide"
        onClick={() => goTo(current - 1)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button
        type="button"
        className="slider-btn slider-next"
        aria-label="Next slide"
        onClick={() => goTo(current + 1)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div className="slider-dots" aria-label="Slides">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className={index === current ? "active" : undefined}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}

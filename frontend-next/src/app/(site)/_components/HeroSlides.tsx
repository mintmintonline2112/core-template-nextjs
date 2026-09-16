"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

export type HeroSlide = {
  src: string;
  alt: string;
  title: string;
  /** HTML đã sanitize phía server. */
  html: string;
};

/**
 * Phần tương tác của section `hero` bố cục slider (dùng trong sections/Hero.tsx):
 * ảnh nền chuyển mờ dần, tiêu đề + mô tả bên trái đổi theo slide, dãy số slide
 * bên phải (bấm để chuyển; vạch vàng chạy theo thời gian tự chuyển).
 * Tự chạy mỗi `interval` ms; dừng khi rê chuột / focus bên trong / tab bị ẩn;
 * không tự chạy khi người xem bật giảm chuyển động.
 */
export function HeroSlides({
  id,
  eyebrow,
  slides,
  interval = 6500,
  children,
}: {
  id: string;
  eyebrow?: string | null;
  slides: HeroSlide[];
  interval?: number;
  /** Phần cố định dưới nội dung slide (nút CTA, số liệu) — render phía server. */
  children?: ReactNode;
}) {
  const count = slides.length;
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(media.matches);
    const onVisibility = () => setTabHidden(document.hidden);
    onMotion();
    onVisibility();
    media.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      media.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const go = useCallback((index: number) => setCurrent(((index % count) + count) % count), [count]);

  const paused = hovered || tabHidden || reducedMotion;

  // Mỗi lần đổi slide (tự chạy hoặc bấm số) hẹn giờ lại từ đầu.
  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = window.setTimeout(() => go(current + 1), interval);
    return () => window.clearTimeout(timer);
  }, [current, paused, count, interval, go]);

  if (count === 0) return null;
  const slide = slides[Math.min(current, count - 1)];
  // Đổi key để vạch tiến độ chạy lại từ đầu, khớp với bộ hẹn giờ.
  const progressKey = `${current}-${paused ? "paused" : "running"}`;

  return (
    <section
      className={`hero-slider${paused ? " is-paused" : ""}`}
      id={id}
      aria-roledescription="carousel"
      aria-label="Prime Nuts USA highlights"
      style={{ ["--hs-interval" as string]: `${interval}ms` } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(false);
      }}
    >
      <div className="hs-media" aria-hidden="true">
        {slides.map((item, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${item.src}-${index}`}
            src={item.src}
            alt=""
            className={index === current ? "is-active" : undefined}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <div className="container hs-inner">
        <div className="hs-copy">
          {eyebrow ? <p className="eyebrow eyebrow-gold">{eyebrow}</p> : null}
          <div className="hs-slide" key={current} aria-live={paused ? "polite" : "off"}>
            <h1>{slide.title}</h1>
            {slide.html ? (
              <div className="hero-cms" dangerouslySetInnerHTML={{ __html: slide.html }} />
            ) : null}
          </div>
          {children}
        </div>

        {count > 1 ? (
          <div className="hs-nav" role="group" aria-label="Choose slide">
            {slides.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                className={`hs-num${index === current ? " is-active" : ""}`}
                aria-label={`Slide ${index + 1} of ${count}: ${item.title}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => go(index)}
              >
                <span className="hs-num-line" key={index === current ? progressKey : "idle"} aria-hidden="true" />
                <span className="hs-num-label">{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
            <p className="hs-count" aria-hidden="true">
              {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

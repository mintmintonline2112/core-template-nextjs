"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Eyebrow, HERO_TEXT } from "./ui";

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
  showEyebrow = false,
  slides,
  interval = 6500,
  children,
}: {
  id: string;
  eyebrow?: string | null;
  /** Section tick "Hiện eyebrow" trong admin → hiện dù toàn site đang ẩn eyebrow. */
  showEyebrow?: boolean;
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

  const go = useCallback(
    (index: number) => setCurrent(((index % count) + count) % count),
    [count],
  );

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
      className="relative isolate flex min-h-[clamp(580px,88vh,840px)] items-center overflow-hidden bg-navy-900 text-light before:absolute before:inset-0 before:-z-1 before:bg-[linear-gradient(90deg,color-mix(in_oklab,var(--navy-900)_95%,transparent)_0%,color-mix(in_oklab,var(--navy-900)_86%,transparent)_34%,color-mix(in_oklab,var(--navy-900)_45%,transparent)_64%,color-mix(in_oklab,var(--navy-900)_20%,transparent)_100%),linear-gradient(0deg,color-mix(in_oklab,var(--navy-900)_55%,transparent)_0%,transparent_30%)] before:content-[''] max-[900px]:min-h-0 max-[900px]:before:bg-[linear-gradient(180deg,color-mix(in_oklab,var(--navy-900)_60%,transparent)_0%,color-mix(in_oklab,var(--navy-900)_92%,transparent)_55%)]"
      id={id}
      aria-roledescription="carousel"
      aria-label="Điểm nổi bật"
      style={
        { ["--hs-interval" as string]: `${interval}ms` } as React.CSSProperties
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setHovered(false);
      }}
    >
      <div className="absolute inset-0 -z-2" aria-hidden="true">
        {slides.map((item, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${item.src}-${index}`}
            src={item.src}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover [transition:opacity_1200ms_var(--ease),transform_7000ms_linear] motion-reduce:[transform:none] motion-reduce:transition-none",
              index === current
                ? "[transform:scale(1)] opacity-100"
                : "[transform:scale(1.08)] opacity-0",
            )}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <div className="site-container grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[clamp(2rem,6vw,5rem)] py-[clamp(5rem,10vw,7.5rem)] max-[900px]:grid-cols-[minmax(0,1fr)] max-[900px]:gap-8">
        <div className="max-w-[41rem]">
          {eyebrow ? (
            <Eyebrow gold heading show={showEyebrow}>
              {eyebrow}
            </Eyebrow>
          ) : null}
          <div
            className="animate-[hs-in_800ms_var(--ease)_both] motion-reduce:animate-none"
            key={current}
            aria-live={paused ? "polite" : "off"}
          >
            <h1 className="mb-[0.5em] text-display font-semibold text-light">
              {slide.title}
            </h1>
            {slide.html ? (
              <div
                className={cn(HERO_TEXT, "max-w-[37rem]")}
                dangerouslySetInnerHTML={{ __html: slide.html }}
              />
            ) : null}
          </div>
          {children}
        </div>

        {count > 1 ? (
          <div
            className="flex flex-col items-end gap-1 max-[900px]:mt-7 max-[900px]:flex-row max-[900px]:items-center max-[900px]:justify-center max-[900px]:gap-5"
            role="group"
            aria-label="Chọn slide"
          >
            {slides.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-4 border-0 bg-transparent px-0 py-1 font-display text-base font-semibold tracking-sm transition-[color] duration-250 ease-brand",
                  // Số đang xem giữ màu vàng cả khi rê chuột.
                  index === current
                    ? "text-gold-300"
                    : "text-light-soft hover:text-light",
                )}
                aria-label={`Slide ${index + 1} / ${count}: ${item.title}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => go(index)}
              >
                {/* Vạch vàng (::after) chạy hết vạch trong đúng `interval` — dừng thì đứng yên, mờ đi. */}
                <span
                  className={cn(
                    "relative h-[2px] w-[34px] overflow-hidden bg-light/25 transition-[width] duration-350 ease-brand max-[900px]:w-[20px]",
                    index === current &&
                      "w-[76px] after:absolute after:inset-0 after:origin-left after:animate-[hs-progress_var(--hs-interval,6500ms)_linear_forwards] after:bg-gold-400 after:content-[''] max-[900px]:w-[44px]",
                    index === current &&
                      paused &&
                      "after:[transform:scaleX(1)] after:animate-none after:opacity-55",
                  )}
                  key={index === current ? progressKey : "idle"}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "transition-[font-size] duration-300 ease-brand",
                    index === current && "text-3xl max-[900px]:text-xl",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            ))}
            <p
              className="mt-4 mb-0 text-xs tracking-2xl text-light-soft max-[900px]:hidden"
              aria-hidden="true"
            >
              {String(current + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

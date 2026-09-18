"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { cn } from "@/utils/cn";
import { PHOTO_FRAME } from "./ui";

/**
 * Slider dải ảnh (section `photo-slider`): máy tính hiện 3 ảnh, dưới 1080px 2
 * ảnh, điện thoại 1 ảnh; mỗi lần trượt MỘT ảnh, trượt VÒNG (ảnh cuối nối tiếp
 * ảnh đầu) nên 3 ảnh trên máy tính vẫn trượt được. Không tự chạy — chuyển bằng
 * mũi tên, chấm, vuốt hoặc phím ←/→. Ít ảnh hơn số ảnh hiển thị (VD 2 ảnh trên
 * máy tính) thì đứng yên, căn giữa.
 *
 * Trượt vòng: chèn bản sao CLONES ảnh cuối vào đầu dải và CLONES ảnh đầu vào
 * cuối dải. Trượt vào vùng bản sao xong thì nhảy (không hiệu ứng) về ảnh thật
 * tương ứng — mắt không thấy vì hai chỗ trông giống hệt nhau.
 *
 * Số ảnh hiển thị khai báo 2 nơi, phải khớp nhau: `--per` trong FRAME (bề rộng
 * slide, vị trí mũi tên) và PER_VIEW (JS — có trượt hay không).
 */

export type CarouselPhoto = { src: string; caption?: string };

const PER_VIEW: Array<[query: string, perView: number]> = [
  ["(max-width: 640px)", 1],
  ["(max-width: 1080px)", 2],
];
const DEFAULT_PER_VIEW = 3;
/** Số bản sao mỗi đầu = số ảnh hiển thị lớn nhất, để lúc nào vùng nhìn thấy cũng đủ ảnh. */
const MAX_PER_VIEW = 3;
const SLIDE_MS = 550;
const STAGGER_MS = 70;

function subscribe(onChange: () => void) {
  const lists = PER_VIEW.map(([query]) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () =>
    lists.forEach((list) => list.removeEventListener("change", onChange));
}
const perViewNow = () =>
  PER_VIEW.find(([query]) => window.matchMedia(query).matches)?.[1] ??
  DEFAULT_PER_VIEW;

const mod = (value: number, n: number) => ((value % n) + n) % n;

/** Khung chung: khai báo số ảnh hiển thị + khe giữa ảnh; là container để mũi tên canh theo bề ngang. */
const FRAME =
  "@container relative touch-pan-y [--gap:--spacing(6)] [--per:3] max-[1080px]:[--per:2] max-[640px]:[--per:1]";

/** Chiều cao ảnh 4:3 của một slide ÷ 2 — mũi tên nằm giữa ảnh, không tính chú thích. */
const ARROW =
  "absolute top-[calc((100cqw_-_(var(--per)_-_1)_*_var(--gap))_/_var(--per)_*_3_/_8)] z-2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-paper/90 text-navy-700 shadow-badge backdrop-blur-sm transition-[background-color,border-color,color,scale] duration-200 ease-brand hover:scale-108 hover:border-navy-700 hover:bg-navy-700 hover:text-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 max-[640px]:size-9 [&>svg]:size-5 max-[640px]:[&>svg]:size-4";

export function PhotoCarousel({
  photos,
  label,
  className,
}: {
  photos: CarouselPhoto[];
  /** Tên vùng slider cho trình đọc màn hình (thường là heading của section). */
  label: string;
  className?: string;
}) {
  const perView = useSyncExternalStore(
    subscribe,
    perViewNow,
    () => DEFAULT_PER_VIEW,
  );
  const n = photos.length;
  const sliding = n > 1 && n >= perView;
  const clones = sliding ? Math.min(n, MAX_PER_VIEW) : 0;
  const slides = sliding
    ? [...photos.slice(n - clones), ...photos, ...photos.slice(0, clones)]
    : photos;

  // pos = vị trí trên dải có bản sao; ảnh thật đầu tiên nằm ở `clones`.
  const [pos, setPos] = useState(clones);
  const [animate, setAnimate] = useState(true);
  const settleTimer = useRef<number | undefined>(undefined);
  const swipeStartX = useRef<number | null>(null);

  // Số bản sao đổi (xoay màn hình / đổi cỡ cửa sổ) → về lại ảnh thật đang xem.
  const current = sliding ? mod(pos - clones, n) : 0;
  const prevClones = useRef(clones);
  useEffect(() => {
    if (prevClones.current === clones) return;
    prevClones.current = clones;
    setAnimate(false);
    setPos(clones + current);
  }, [clones, current]);

  // Tắt hiệu ứng để nhảy về ảnh thật → bật lại ở khung hình sau.
  useEffect(() => {
    if (animate) return;
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimate(true)),
    );
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const moveTo = (target: number) => {
    if (!sliding || settleTimer.current !== undefined) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const settled = clones + mod(target - clones, n);
    if (reduced) {
      setAnimate(false);
      setPos(settled);
      return;
    }
    setAnimate(true);
    setPos(target);
    // Hết lượt trượt: đang đứng ở bản sao thì nhảy về ảnh thật.
    settleTimer.current = window.setTimeout(() => {
      settleTimer.current = undefined;
      if (settled !== target) {
        setAnimate(false);
        setPos(settled);
      }
    }, SLIDE_MS + 30);
  };
  const step = (direction: 1 | -1) => moveTo(pos + direction);

  const visibleCount = Math.min(perView, n);
  const liveText =
    visibleCount === 1
      ? `Ảnh ${current + 1} / ${n}`
      : `Ảnh ${Array.from({ length: visibleCount }, (_, k) => mod(current + k, n) + 1).join(", ")} / ${n}`;

  return (
    <div
      className={cn(FRAME, "reveal", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        step(e.key === "ArrowRight" ? 1 : -1);
      }}
      onPointerDown={(e) => {
        swipeStartX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (swipeStartX.current === null) return;
        const dx = e.clientX - swipeStartX.current;
        if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
        swipeStartX.current = null;
      }}
    >
      {/* clip chỉ cắt chiều ngang (bóng đổ dưới ảnh vẫn hiện). Vùng cắt nới ra mỗi
          bên 1rem (-mx-4 px-4) — nhỏ hơn khe 1.5rem giữa ảnh — để bóng hai mép không
          bị cắt cứng mà ảnh kế bên vẫn ẩn. */}
      <div className="-mx-4 overflow-x-clip px-4">
        <div
          className={cn(
            "reveal-group flex [transform:translateX(calc(var(--i)_*_-1_*_(100%_+_var(--gap))_/_var(--per)))] gap-(--gap) motion-reduce:transition-none",
            animate
              ? "transition-transform duration-550 ease-brand"
              : "transition-none",
            !sliding && "justify-center",
          )}
          style={{ "--i": sliding ? pos : 0 } as CSSProperties}
        >
          {slides.map((photo, k) => {
            const shown = sliding ? k >= pos && k < pos + perView : k < perView;
            const isClone = sliding && (k < clones || k >= clones + n);
            return (
              <figure
                className="m-0 min-w-0 flex-[0_0_calc((100%_-_(var(--per)_-_1)_*_var(--gap))_/_var(--per))]"
                key={`${isClone ? "clone-" : ""}${k}-${photo.src}`}
                style={
                  {
                    "--reveal-delay": `${shown ? (k - (sliding ? pos : 0)) * STAGGER_MS : 0}ms`,
                  } as CSSProperties
                }
                aria-hidden={!shown}
              >
                <div className={cn(PHOTO_FRAME, "aspect-4/3")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="[-webkit-user-drag:none]"
                    src={photo.src}
                    alt={photo.caption ?? ""}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
                {photo.caption ? (
                  <figcaption className="mt-3 text-center font-display text-base text-ink-faint italic">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      </div>

      {sliding ? (
        <>
          <button
            type="button"
            className={cn(
              ARROW,
              "left-0 -translate-x-1/2 max-[640px]:left-2 max-[640px]:translate-x-0",
            )}
            aria-label="Ảnh trước"
            onClick={() => step(-1)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            className={cn(
              ARROW,
              "right-0 translate-x-1/2 max-[640px]:right-2 max-[640px]:translate-x-0",
            )}
            aria-label="Ảnh tiếp theo"
            onClick={() => step(1)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="mt-7 flex justify-center gap-2">
            {photos.map((photo, i) => (
              <button
                key={`${i}-${photo.src}`}
                type="button"
                className={cn(
                  "h-2.25 cursor-pointer rounded-full border-0 p-0 transition-[background-color,width] duration-250 ease-brand",
                  i === current
                    ? "w-5.5 bg-gold-500"
                    : "w-2.25 bg-navy-700/20 hover:bg-navy-700/40",
                )}
                aria-label={`Xem ảnh ${i + 1}`}
                aria-current={i === current}
                onClick={() => moveTo(clones + i)}
              />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            {liveText}
          </p>
        </>
      ) : null}
    </div>
  );
}

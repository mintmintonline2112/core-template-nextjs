"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Toàn bộ hiệu ứng trang trí của site (port từ bản tĩnh frontend/js/main.js):
 * scroll-reveal + stagger, đếm số, tách chữ tiêu đề, aperture/pan ảnh
 * (ScrollTrigger), nút nam châm, thẻ nghiêng 3D, thanh tiến độ.
 * Chạy lại mỗi lần đổi route; tôn trọng prefers-reduced-motion.
 *
 * Móc trong markup (không mang style riêng — style theo trạng thái nằm ở
 * styles/effects.css):
 *   .reveal / .reveal-group   hiện dần khi cuộn tới (thêm .is-visible)
 *   data-stagger="N"          mỗi con trực tiếp trễ thêm N ms
 *   data-count                số chạy đếm khi hiện
 *   h1[data-headline]         tách từng chữ, trồi lên (GSAP)
 *   .photo-frame img          mở khẩu độ + trượt dọc theo cuộn (GSAP)
 *   .news-card-thumb img      mở khẩu độ; .news-featured-photo img: cả hai
 *   .btn-gold                 nút nam châm theo chuột
 *   .tilt-card                thẻ nghiêng 3D theo chuột
 */
export function SiteEffects() {
  const pathname = usePathname();
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("js");

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const cleanups: Array<() => void> = [];

    /* ---------- Stagger delays ---------- */
    document
      .querySelectorAll<HTMLElement>("[data-stagger]")
      .forEach((group) => {
        const step = Number(group.dataset.stagger) || 0;
        Array.from(group.children).forEach((el, i) => {
          (el as HTMLElement).style.setProperty(
            "--reveal-delay",
            `${i * step}ms`,
          );
        });
      });

    /* ---------- Count-up ---------- */
    function countUp(el: Element) {
      const target = Number.parseInt(el.getAttribute("data-count") ?? "", 10);
      const host = el as HTMLElement;
      if (!Number.isFinite(target) || host.dataset.counted) return;
      host.dataset.counted = "true";
      let start: number | null = null;
      const tick = (now: number) => {
        if (start === null) start = now;
        const progress = Math.min((now - start) / 1400, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        if (host.firstChild)
          host.firstChild.nodeValue = String(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    /* ---------- Scroll reveal ---------- */
    const revealEls = document.querySelectorAll(".reveal");
    let revealObserver: IntersectionObserver | null = null;

    if (reduced || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            entry.target.querySelectorAll("[data-count]").forEach(countUp);
            revealObserver?.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      );
      revealEls.forEach((el) => revealObserver?.observe(el));
      cleanups.push(() => revealObserver?.disconnect());
    }

    /* ---------- Scroll progress ---------- */
    const bar = progressRef.current;
    let progressPending = false;
    const updateProgress = () => {
      if (!bar) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const onProgressScroll = () => {
      if (progressPending) return;
      progressPending = true;
      requestAnimationFrame(() => {
        updateProgress();
        progressPending = false;
      });
    };
    window.addEventListener("scroll", onProgressScroll, { passive: true });
    updateProgress();
    cleanups.push(() => window.removeEventListener("scroll", onProgressScroll));

    /* ---------- GSAP choreography ---------- */
    if (!reduced) {
      gsap.registerPlugin(ScrollTrigger);
      document.documentElement.classList.add("gsap");

      // Tiêu đề lớn: mỗi từ trồi lên từ mặt nạ riêng.
      const headline = document.querySelector<HTMLElement>("h1[data-headline]");
      if (headline && !headline.dataset.split) {
        headline.dataset.split = "true";
        headline.classList.remove("reveal");
        headline.classList.add("is-visible");
        const words = (headline.textContent ?? "").trim().split(/\s+/);
        headline.innerHTML = words
          .map(
            (w) =>
              `<span class="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top"><span class="inline-block will-change-transform">${w}</span></span>`,
          )
          .join(" ");
        gsap.from(headline.querySelectorAll(":scope > span > span"), {
          yPercent: 115,
          rotate: 3,
          duration: 0.9,
          stagger: 0.055,
          ease: "expo.out",
          delay: 0.15,
        });
      }

      // Ảnh: mở khẩu độ khi vào màn hình…
      document
        .querySelectorAll<HTMLImageElement>(
          ".photo-frame img, .news-card-thumb img, .news-featured-photo img",
        )
        .forEach((img) => {
          const frame = img.closest(
            ".photo-frame, .news-card-thumb, .news-featured-photo",
          );
          gsap.fromTo(
            img,
            { clipPath: "inset(16% 16% 16% 16%)", opacity: 0.3 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              opacity: 1,
              duration: 1.25,
              ease: "power3.out",
              scrollTrigger: { trigger: frame, start: "top 88%", once: true },
            },
          );
        });

      // …và pan dọc trong khung khi cuộn (parallax scrub).
      document
        .querySelectorAll<HTMLImageElement>(
          ".photo-frame img, .news-featured-photo img",
        )
        .forEach((img) => {
          const frame = img.closest(".photo-frame, .news-featured-photo");
          gsap.fromTo(
            img,
            { yPercent: -11, scale: 1.24 },
            {
              yPercent: 11,
              scale: 1.24,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.4,
              },
            },
          );
        });

      // Nút nam châm cho CTA chính.
      if (finePointer) {
        document.querySelectorAll<HTMLElement>(".btn-gold").forEach((btn) => {
          const xTo = gsap.quickTo(btn, "x", {
            duration: 0.4,
            ease: "power3.out",
          });
          const yTo = gsap.quickTo(btn, "y", {
            duration: 0.4,
            ease: "power3.out",
          });
          const onMove = (e: MouseEvent) => {
            const r = btn.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * 0.28);
            yTo((e.clientY - r.top - r.height / 2) * 0.4);
          };
          const onLeave = () => {
            gsap.to(btn, {
              x: 0,
              y: 0,
              duration: 0.7,
              ease: "elastic.out(1, 0.45)",
            });
          };
          btn.addEventListener("mousemove", onMove);
          btn.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            btn.removeEventListener("mousemove", onMove);
            btn.removeEventListener("mouseleave", onLeave);
          });
        });
      }

      cleanups.push(() => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      });
    }

    /* ---------- Thẻ nghiêng 3D ---------- */
    if (!reduced && finePointer) {
      document.querySelectorAll<HTMLElement>(".tilt-card").forEach((card) => {
        const onMove = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
          card.style.transform = `perspective(900px) translateY(-4px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        };
        const onLeave = () => {
          card.style.transform = "";
        };
        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          card.removeEventListener("mousemove", onMove);
          card.removeEventListener("mouseleave", onLeave);
        });
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  return (
    <div
      ref={progressRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-300 h-[3px] origin-[0_50%] [transform:scaleX(0)] bg-[linear-gradient(90deg,var(--gold-500),var(--gold-300))]"
      aria-hidden="true"
    />
  );
}

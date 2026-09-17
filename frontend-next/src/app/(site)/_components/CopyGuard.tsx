"use client";

import { useEffect } from "react";

/**
 * Admin → Cài đặt → "Hạn chế sao chép nội dung": chặn chuột phải, bôi đen,
 * Ctrl+C / cắt và kéo ảnh trên website. Ô nhập liệu (form báo giá, liên hệ…)
 * vẫn gõ / dán / chọn chữ bình thường.
 *
 * Chỉ là rào mềm phía trình duyệt — không chặn được người rành kỹ thuật.
 * Bật class `copy-guard` trên <html>; kiểu chữ không bôi đen nằm ở effects.css.
 */
const EDITABLE = "input, textarea, select, [contenteditable='true']";

function fromEditable(event: Event): boolean {
  const target = event.target;
  return target instanceof Element && target.closest(EDITABLE) !== null;
}

export function CopyGuard() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("copy-guard");

    const block = (event: Event) => {
      if (!fromEditable(event)) event.preventDefault();
    };
    const blockImageDrag = (event: DragEvent) => {
      if (event.target instanceof HTMLImageElement) event.preventDefault();
    };
    const events = ["contextmenu", "copy", "cut", "selectstart"] as const;

    events.forEach((name) => document.addEventListener(name, block));
    document.addEventListener("dragstart", blockImageDrag);
    return () => {
      root.classList.remove("copy-guard");
      events.forEach((name) => document.removeEventListener(name, block));
      document.removeEventListener("dragstart", blockImageDrag);
    };
  }, []);

  return null;
}

import type { ReactNode } from "react";
import type { SocialKey, SocialLinks } from "@/lib/settings";

/**
 * Icon mạng xã hội lấy từ Admin → Cài đặt → Mạng xã hội.
 * Link nào bỏ trống thì ẩn icon đó; không có link nào thì không render gì.
 */

const ICONS: Record<SocialKey, { label: string; path: ReactNode }> = {
  facebook: {
    label: "Facebook",
    path: (
      <path d="M14 8.5h2.2V5.6h-2.6c-2.3 0-3.6 1.4-3.6 3.7v1.6H7.8v2.9H10V21h3v-7.2h2.3l.4-2.9H13V9.6c0-.8.3-1.1 1-1.1Z" />
    ),
  },
  youtube: {
    label: "YouTube",
    path: (
      <>
        <path d="M21.2 8.6a2.6 2.6 0 0 0-1.8-1.8C17.8 6.4 12 6.4 12 6.4s-5.8 0-7.4.4A2.6 2.6 0 0 0 2.8 8.6C2.4 10.2 2.4 12 2.4 12s0 1.8.4 3.4a2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.4.4 7.4.4s5.8 0 7.4-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-3.4.4-3.4s0-1.8-.4-3.4Z" />
        <path d="M10.2 14.9 15 12l-4.8-2.9v5.8Z" fill="#fff" />
      </>
    ),
  },
  instagram: {
    label: "Instagram",
    path: (
      <>
        <rect
          x="3.4"
          y="3.4"
          width="17.2"
          height="17.2"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="17.1" cy="6.9" r="1.2" />
      </>
    ),
  },
  tiktok: {
    label: "TikTok",
    path: (
      <path d="M14.4 3h2.7c.2 1.7 1.2 3.1 2.9 3.4v2.7a6.4 6.4 0 0 1-3.4-1.1v5.9a5.4 5.4 0 1 1-4.6-5.3v2.8a2.6 2.6 0 1 0 1.8 2.5V3Z" />
    ),
  },
};

const ORDER: SocialKey[] = ["facebook", "youtube", "instagram", "tiktok"];

export function SocialIcons({
  links,
  className,
  linkClassName,
  label = "Mạng xã hội",
}: {
  links?: SocialLinks | null;
  className?: string;
  /** Class cho từng nút icon (thẻ <a>). */
  linkClassName?: string;
  label?: string;
}) {
  const items = ORDER.filter((key) => links?.[key]?.trim());
  if (items.length === 0) return null;

  return (
    <div className={className} aria-label={label} role="group">
      {items.map((key) => (
        <a
          key={key}
          href={links![key]!}
          target="_blank"
          rel="noreferrer noopener"
          className={linkClassName}
          aria-label={ICONS[key].label}
          title={ICONS[key].label}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {ICONS[key].path}
          </svg>
        </a>
      ))}
    </div>
  );
}

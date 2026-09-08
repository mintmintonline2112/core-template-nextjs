import { mediaUrl } from "@/app/(site)/_lib/cms";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import type { PageSection } from "@/types/cms";

/**
 * Đồ dùng chung cho các section component (components/site/sections/*):
 * props chuẩn, helper đọc metadata an toàn, khung section, đầu khối, icon.
 */

export type SectionProps = { section: PageSection; index: number };

export type Meta = Record<string, unknown>;

export const meta = (section: PageSection): Meta => (section.metadata ?? {}) as Meta;

export const resolveImage = (path: string) =>
  path.startsWith("/images/") ? path : (mediaUrl(path) ?? path);

/** metadata[key] dạng mảng chuỗi (lọc rác). */
export function strings(m: Meta, key: string): string[] {
  const raw = m[key];
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string" && !!v) : [];
}

/** metadata[key] dạng mảng object; item chuỗi cũ được nâng thành {label,title}. */
export function items(m: Meta, key: string): Array<Record<string, string>> {
  const raw = m[key];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return { label: item, title: item };
      if (item && typeof item === "object") {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(item as Meta)) {
          if (typeof v === "string") out[k] = v;
        }
        return out;
      }
      return null;
    })
    .filter((item): item is Record<string, string> => !!item && Object.keys(item).length > 0);
}

/* Bộ icon dùng lại cho card/list (xoay vòng theo thứ tự). */
export const CARD_ICONS: React.ReactNode[] = [
  <><path key="a" d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle key="b" cx="12" cy="10" r="2.6" /></>,
  <path key="a" d="M12 2c1 4-1 7-4 9 4 0 7-2 8-6 .8 5-2 10-8 11C4 15 4 8 8 5c-1 3 0 5 1 6 0-4 1-7 3-9z" />,
  <><path key="a" d="M12 4v16M5 8l7-4 7 4" /><path key="b" d="M5 8l-2.5 6a3.5 3.5 0 0 0 7 0L7 8M19 8l-2.5 6a3.5 3.5 0 0 0 7 0L21 8" /><path key="c" d="M8 20h8" /></>,
  <><path key="a" d="M4 21v-4M4 13v-2M4 7V3M12 21v-8M12 9V3M20 21v-2M20 15V3" /><circle key="b" cx="4" cy="15" r="2" /><circle key="c" cx="12" cy="11" r="2" /><circle key="d" cx="20" cy="17" r="2" /></>,
  <path key="a" d="M3 17h18l-2 4H5l-2-4zM6 17V9l4-2v10M14 17V7l4 2v8" />,
  <path key="a" d="M12 21c-5-3.5-8-7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 4-3 7.5-8 11z" />,
];

export const ALMOND_ICON = (
  <>
    <path d="M12 3.5 C 16 7.5 18.5 12 17.2 15.9 C 16.2 18.9 7.8 18.9 6.8 15.9 C 5.5 12 8 7.5 12 3.5 Z" />
    <path d="M12 7.2 C 13.8 9.6 14.9 12.1 14.3 14.5" />
  </>
);

export function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="icon-badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

/** Đầu khối: eyebrow + heading + đoạn intro (rich-text đã sanitize). */
export function Head({ section, light = false }: { section: PageSection; light?: boolean }) {
  if (!section.heading && !section.subheading && !section.content) return null;
  return (
    <div className={`section-head${light ? " section-head-light" : ""} reveal`}>
      {section.subheading ? (
        <p className={`eyebrow${light ? " eyebrow-gold" : ""}`}>{section.subheading}</p>
      ) : null}
      {section.heading ? <h2>{section.heading}</h2> : null}
      {section.content ? (
        <div
          className="section-intro"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(section.content) }}
        />
      ) : null}
    </div>
  );
}

/** Khung section: nền thường / kem xen kẽ / xanh đậm. */
export function Shell({
  tint,
  dark,
  id,
  children,
}: {
  tint?: boolean;
  dark?: boolean;
  id: string;
  children: React.ReactNode;
}) {
  const cls = dark ? "section section-dark" : tint ? "section section-tint" : "section";
  return (
    <section className={cls} id={id}>
      <div className="container">{children}</div>
    </section>
  );
}

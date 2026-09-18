import Link from "next/link";
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";

export type BrandProps = {
  footer?: boolean;
  /** Admin → Cài đặt → Logo: có ảnh thì thay hẳn SVG + chữ mặc định. */
  logoUrl?: string | null;
  logoHeight?: number | null;
  brandName?: string | null;
};

/** Logo SVG mặc định của theme (dùng khi admin chưa upload logo). */
export function BrandMark({ footer = false }: { footer?: boolean }) {
  return (
    <svg
      className="h-[42px] w-[42px] shrink-0"
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="19"
        fill={
          footer
            ? "color-mix(in oklab, var(--gold-300) 12%, transparent)"
            : "var(--navy-700)"
        }
      />
      <path
        d="M20 6.5 C 26.5 13 30.5 20.5 28.4 26.6 C 26.8 31.4 13.2 31.4 11.6 26.6 C 9.5 20.5 13.5 13 20 6.5 Z"
        fill="none"
        stroke="var(--gold-300)"
        strokeWidth="1.6"
      />
      <path
        d="M20 12.5 C 23 16.5 24.8 20.6 23.8 24.6"
        fill="none"
        stroke="var(--gold-300)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Logo + wordmark dùng chung cho header và footer. */
export function Brand({
  footer = false,
  logoUrl,
  logoHeight,
  brandName,
}: BrandProps) {
  const name = brandName?.trim() || "Your Company";
  return (
    <Link
      href={siteRoutes.home}
      className="inline-flex items-center gap-3 text-navy-700"
      aria-label={`${name} — home`}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="block h-[42px] w-auto max-w-[260px] object-contain"
          src={logoUrl}
          alt={name}
          style={logoHeight ? { height: logoHeight } : undefined}
        />
      ) : (
        <>
          <BrandMark footer={footer} />
          <span className="flex flex-col leading-tight">
            <span
              className={cn(
                "text-xl font-bold tracking-xs",
                footer ? "text-light" : "text-navy-700",
              )}
            >
              {brandName?.trim() ? (
                name
              ) : (
                <>
                  Your{" "}
                  <em className="font-medium text-gold-500 italic">Company</em>
                </>
              )}
            </span>
            <span
              className={cn(
                "mt-1 text-2xs tracking-xl uppercase",
                footer ? "text-light-soft" : "text-ink-faint",
              )}
            >
              {footer ? "Location, Country" : "Your Tagline"}
            </span>
          </span>
        </>
      )}
    </Link>
  );
}

import Link from "next/link";

/** Logo + wordmark dùng chung cho header và footer. */
export function BrandMark({ footer = false }: { footer?: boolean }) {
  return (
    <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
      <circle
        cx="20"
        cy="20"
        r="19"
        fill={footer ? "rgba(217,180,95,0.12)" : "var(--green-700)"}
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

export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      href="/"
      className={footer ? "brand brand-footer" : "brand"}
      aria-label="Prime Nuts USA — home"
    >
      <BrandMark footer={footer} />
      <span className="brand-text">
        <span className="brand-name">
          Prime Nuts <em>USA</em>
        </span>
        <span className="brand-tag">
          {footer ? "California, USA" : "California Almonds"}
        </span>
      </span>
    </Link>
  );
}

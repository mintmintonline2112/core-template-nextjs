"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SiteMenuItem } from "@/app/(site)/_lib/site-menu";
import { Brand, type BrandProps } from "./Brand";
import { SocialIcons } from "./SocialIcons";
import { siteRoutes } from "@/config/routes";
import type { SiteContact, SocialLinks } from "@/lib/settings";
import { isActivePath } from "@/utils/route";

/**
 * Header 2 tầng:
 * - Utility bar (nền navy): hotline + email (Admin → Liên hệ) và icon mạng xã
 *   hội (Admin → Cài đặt). Cuộn xuống thì tầng này thu lại, chỉ còn thanh menu.
 * - Thanh chính (nền kem, dính đầu trang): logo, menu từ CMS, nút báo giá.
 */
export function Header({
  menu,
  brand,
  contact,
  social,
}: {
  menu: SiteMenuItem[];
  brand?: BrandProps;
  contact?: SiteContact;
  social?: SocialLinks | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const isCurrent = (href: string) => isActivePath(pathname, href, siteRoutes.home);

  return (
    <header
      className={`site-header${scrolled ? " scrolled" : ""}${open ? " nav-open" : ""}`}
      id="site-header"
    >
      <div className="site-topbar">
        <div className="container topbar-inner">
          <div className="topbar-contact">
            {contact?.phone ? (
              <a className="topbar-hotline" href={contact.phoneHref}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M6.5 3.5h3l1.4 3.6-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 3.6 1.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="topbar-key">Hotline</span>
                <strong>{contact.phone}</strong>
              </a>
            ) : null}
            {contact?.email ? (
              <a className="topbar-mail" href={`mailto:${contact.email}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3.2" y="5.2" width="17.6" height="13.6" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m4 7 8 5.6L20 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                {contact.email}
              </a>
            ) : null}
          </div>

          <SocialIcons links={social} className="topbar-social" label="Prime Nuts USA on social media" />
        </div>
      </div>

      <div className="header-bar">
        <div className="container header-inner">
          <Brand {...brand} />

          <nav className="site-nav" id="site-nav" aria-label="Primary">
            {menu.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={siteRoutes.contact}
              className="btn btn-gold btn-sm nav-cta"
              onClick={() => setOpen(false)}
            >
              Request a Quote
            </Link>

            {/* Menu mobile: nhắc lại hotline + social vì utility bar rất hẹp. */}
            <div className="nav-foot">
              {contact?.phone ? (
                <a className="nav-foot-call" href={contact.phoneHref}>
                  {contact.phone}
                </a>
              ) : null}
              <SocialIcons links={social} className="nav-foot-social" />
            </div>
          </nav>

          <button
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
          </button>
        </div>
      </div>
    </header>
  );
}

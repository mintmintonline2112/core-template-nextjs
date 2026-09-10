"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SiteMenuItem } from "@/app/(site)/_lib/site-menu";
import { Brand, type BrandProps } from "./Brand";
import { siteRoutes } from "@/config/routes";
import { isActivePath } from "@/utils/route";

/** Header dính đầu trang: menu từ CMS, toggle mobile, thu gọn khi cuộn. */
export function Header({ menu, brand }: { menu: SiteMenuItem[]; brand?: BrandProps }) {
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
            className="btn btn-primary btn-sm nav-cta"
            onClick={() => setOpen(false)}
          >
            Request a Quote
          </Link>
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
    </header>
  );
}

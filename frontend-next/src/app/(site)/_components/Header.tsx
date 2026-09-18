"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SiteMenuItem } from "@/app/(site)/_lib/site-menu";
import { Brand, type BrandProps } from "./Brand";
import { SocialIcons } from "./SocialIcons";
import { siteRoutes } from "@/config/routes";
import type { SiteContact, SocialLinks } from "@/lib/settings";
import { cn } from "@/utils/cn";
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

  const isCurrent = (href: string) =>
    isActivePath(pathname, href, siteRoutes.home);

  return (
    // data-scrolled / data-open: trạng thái cuộn + menu mobile, các tầng con đọc
    // qua variant `group-data-*/header`.
    <header
      className="group/header sticky top-0 z-100 transition-shadow duration-250 ease-brand data-scrolled:shadow-lift"
      data-scrolled={scrolled ? "" : undefined}
      data-open={open ? "" : undefined}
      id="site-header"
    >
      <div className="max-h-12 overflow-hidden bg-navy-700 text-sm text-light-soft [transition:max-height_320ms_var(--ease),opacity_240ms_var(--ease)] group-data-scrolled/header:max-h-0 group-data-scrolled/header:opacity-0 max-[900px]:text-xs">
        <div className="site-container flex min-h-12 items-center justify-between gap-6 max-[640px]:gap-3">
          <div className="flex min-w-0 items-center gap-7">
            {contact?.phone ? (
              <a
                className={cn(TOPBAR_LINK, "group/hotline")}
                href={contact.phoneHref}
              >
                <svg
                  className={TOPBAR_ICON}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M6.5 3.5h3l1.4 3.6-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 3.6 1.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-2xs tracking-lg text-light/55 uppercase max-[640px]:hidden">
                  Hotline
                </span>
                <strong className="font-display text-base font-bold tracking-xs text-light transition-[color] duration-200 ease-brand group-hover/hotline:text-gold-300 max-[900px]:text-sm">
                  {contact.phone}
                </strong>
              </a>
            ) : null}
            {contact?.email ? (
              <a className={TOPBAR_LINK} href={`mailto:${contact.email}`}>
                <svg
                  className={TOPBAR_ICON}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="3.2"
                    y="5.2"
                    width="17.6"
                    height="13.6"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="m4 7 8 5.6L20 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                {contact.email}
              </a>
            ) : null}
          </div>

          <SocialIcons
            links={social}
            className="inline-flex items-center gap-2"
            linkClassName="grid h-[30px] w-[30px] place-items-center rounded-full border border-light/20 text-light-soft transition-[color,background-color,border-color] duration-200 ease-brand hover:border-gold-300 hover:bg-gold-300 hover:text-navy-900 max-[640px]:h-[26px] max-[640px]:w-[26px] [&>svg]:h-[15px] [&>svg]:w-[15px] max-[640px]:[&>svg]:h-[13px] max-[640px]:[&>svg]:w-[13px]"
            label="Mạng xã hội của chúng tôi"
          />
        </div>
      </div>

      <div className="border-b border-b-line-soft bg-cream/95 backdrop-blur-[10px] transition-[border-color] duration-250 ease-brand group-data-scrolled/header:border-b-line">
        <div className="site-container flex items-center justify-between gap-6 py-3 transition-[padding] duration-300 ease-brand group-data-scrolled/header:py-2">
          <Brand {...brand} />

          <nav
            className="flex items-center gap-6 max-[900px]:absolute max-[900px]:inset-x-0 max-[900px]:top-full max-[900px]:hidden max-[900px]:flex-col max-[900px]:items-stretch max-[900px]:gap-0 max-[900px]:border-b max-[900px]:border-b-line max-[900px]:bg-cream max-[900px]:px-6 max-[900px]:pt-2 max-[900px]:pb-6 max-[900px]:shadow-float max-[900px]:group-data-open/header:flex"
            id="site-nav"
            aria-label="Menu chính"
          >
            {menu.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={NAV_LINK}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={siteRoutes.contact}
              className="btn btn-gold btn-sm ml-3 font-display text-xs tracking-md max-[900px]:mt-4 max-[900px]:ml-0 max-[900px]:justify-center"
              onClick={() => setOpen(false)}
            >
              Nhận báo giá
            </Link>

            {/* Menu mobile: nhắc lại hotline + social vì utility bar rất hẹp. Hai
                link này mang kiểu chữ của mục menu (NAV_LINK) như giao diện hiện có. */}
            <div className="mt-4 hidden flex-wrap items-center justify-between gap-4 border-t border-t-line-soft pt-4 max-[900px]:flex">
              {contact?.phone ? (
                <a className={NAV_LINK} href={contact.phoneHref}>
                  {contact.phone}
                </a>
              ) : null}
              <SocialIcons
                links={social}
                className="inline-flex items-center gap-2"
                linkClassName={cn(
                  NAV_LINK,
                  "grid h-[34px] w-[34px] place-items-center rounded-full border border-line hover:border-gold-300 hover:bg-gold-300 [&>svg]:h-4 [&>svg]:w-4",
                )}
              />
            </div>
          </nav>

          <button
            className="hidden h-11 w-11 flex-col justify-center gap-[5px] rounded border border-line bg-transparent p-[10px] max-[900px]:flex"
            type="button"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span
              className={cn(
                TOGGLE_BAR,
                "group-data-open/header:[transform:translateY(6.6px)_rotate(45deg)]",
              )}
            />
            <span
              className={cn(TOGGLE_BAR, "group-data-open/header:opacity-0")}
            />
            <span
              className={cn(
                TOGGLE_BAR,
                "group-data-open/header:[transform:translateY(-6.6px)_rotate(-45deg)]",
              )}
            />
          </button>
        </div>
      </div>
    </header>
  );
}

/** Link hotline / email trên utility bar. */
const TOPBAR_LINK =
  "inline-flex items-center gap-2 whitespace-nowrap text-light-soft transition-[color] duration-200 ease-brand hover:text-gold-300";

const TOPBAR_ICON = "h-[17px] w-[17px] shrink-0 text-gold-300";

/** Mục menu chính: gạch vàng chạy ra khi rê chuột; dưới 900px thành dòng trong menu thả. */
const NAV_LINK =
  "relative py-2 font-display text-xs font-semibold tracking-md text-ink-soft uppercase transition-[color] duration-200 ease-brand after:absolute after:right-full after:bottom-0 after:left-0 after:h-[2px] after:bg-gold-500 after:transition-[right] after:duration-220 after:ease-brand after:content-[''] hover:text-navy-700 hover:after:right-0 max-[900px]:border-b max-[900px]:border-b-line-soft max-[900px]:py-3 max-[900px]:text-lg max-[900px]:after:content-none";

/** Một vạch của nút hamburger — 3 vạch xoay thành dấu X khi mở menu. */
const TOGGLE_BAR =
  "block h-[1.6px] w-full bg-navy-700 [transition:transform_250ms_var(--ease),opacity_200ms_var(--ease)]";

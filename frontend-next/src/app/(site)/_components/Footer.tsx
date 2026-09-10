import Link from "next/link";
import { Brand } from "./Brand";
import { SITE_CONTACT } from "@/config/contact";
import { siteRoutes } from "@/config/routes";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Brand footer />
          <p className="footer-tagline">
            California Almonds. Global Markets. Reliable Supply.
          </p>
        </div>

        <nav className="footer-col" aria-label="Explore">
          <h4>Explore</h4>
          <Link href={siteRoutes.products}>Our Products</Link>
          <Link href={siteRoutes.homeSection('markets')}>Global Markets</Link>
          <Link href={siteRoutes.homeSection('orders')}>Bulk &amp; Container Orders</Link>
          <Link href={siteRoutes.homeSection('sourcing')}>California Sourcing</Link>
          <Link href={siteRoutes.homeSection('logistics')}>Export &amp; Logistics</Link>
        </nav>

        <nav className="footer-col" aria-label="Company">
          <h4>Company</h4>
          <Link href={siteRoutes.homeSection('why')}>Why Prime Nuts USA</Link>
          <Link href={siteRoutes.homeSection('serve')}>Who We Serve</Link>
          <Link href={siteRoutes.news}>News &amp; Insights</Link>
          <Link href={siteRoutes.contact}>Contact</Link>
        </nav>

        <div className="footer-col">
          <h4>Contact</h4>
          <address className="footer-contact">
            <a className="footer-contact-row" href={SITE_CONTACT.phoneHref}>
              <span className="footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 4h4l1.8 4.5-2.3 1.7a13 13 0 0 0 5.3 5.3l1.7-2.3L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.8 20 4 13.2 3.5 5.6A1.5 1.5 0 0 1 5 4z" />
                </svg>
              </span>
              <span>{SITE_CONTACT.phone}</span>
            </a>
            <a className="footer-contact-row" href={`mailto:${SITE_CONTACT.email}`}>
              <span className="footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3.5 6.5 8.5 7 8.5-7" />
                </svg>
              </span>
              <span>{SITE_CONTACT.email}</span>
            </a>
            <div className="footer-contact-row">
              <span className="footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.6" />
                </svg>
              </span>
              <span>{SITE_CONTACT.address}<br />{SITE_CONTACT.location}</span>
            </div>
          </address>
          <Link href={siteRoutes.contact} className="btn btn-gold btn-sm">
            Request a Quote
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Prime Nuts USA. All rights reserved.</p>
        <p className="footer-legal">
          Photos via Wikimedia Commons &amp; rawpixel —{" "}
          <a href="/images/CREDITS.md">photo credits</a>
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Brand } from "@/components/site/Brand";

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
          <Link href="/products">Our Products</Link>
          <Link href="/#markets">Global Markets</Link>
          <Link href="/#orders">Bulk &amp; Container Orders</Link>
          <Link href="/#sourcing">California Sourcing</Link>
          <Link href="/#logistics">Export &amp; Logistics</Link>
        </nav>

        <nav className="footer-col" aria-label="Company">
          <h4>Company</h4>
          <Link href="/#why">Why Prime Nuts USA</Link>
          <Link href="/#serve">Who We Serve</Link>
          <Link href="/news">News &amp; Insights</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className="footer-col">
          <h4>Prime Nuts USA</h4>
          <p className="footer-address">California, United States</p>
          <Link href="/contact" className="btn btn-gold btn-sm">
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

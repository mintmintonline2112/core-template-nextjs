# Prime Nuts USA — Website Demo

Static B2B landing page for Prime Nuts USA — California almond supply for U.S. and global markets.
Built with plain HTML, CSS, and JavaScript (no build step, no dependencies).

## Structure

```
primenutsvn/
├── index.html          # Home (hero, markets, products overview, orders,
│                       # sourcing, logistics, who-we-serve, why-us, quote form)
├── products.html       # Our Products — natural varieties (Nonpareil, Independence,
│                       # Monterey, Carmel, Butte, Padre) + processed almonds
│                       # (blanched, sliced, slivered, diced, flour & meal) + sizes
├── news.html           # News & Insights — featured article, article grid,
│                       # newsletter signup (demo)
├── contact.html        # Contact — info cards, inquiry form, quotation checklist
├── css/
│   └── styles.css      # Design tokens + all styling (brand green #295328,
│                       # EB Garamond, cream/gold palette, responsive layout)
├── js/
│   └── main.js         # Shared: mobile nav, sticky header, scroll-reveal,
│                       # active-link highlighting, form validation + success states
├── assets/
│   ├── favicon.svg     # Almond mark favicon
│   └── images/         # Photos (rawpixel CC0 + Wikimedia Commons) + CREDITS.md
│                       # CC BY-SA files require the attribution listed in CREDITS.md
└── skills/, tools/     # (not part of the website)
```

## Run it

Open `index.html` directly in a browser, or serve the folder:

```
python -m http.server 8000
```

then visit http://localhost:8000

## Design notes

- **Primary color:** `#295328` (deep almond-orchard green) — full token set in `:root` of `styles.css`
- **Typeface:** Roboto (Google Fonts) with Segoe UI/Arial fallback
- **Accent:** almond-gold `#C9A25E` / `#D9B45F` for CTAs, rules, and botanical line art
- Scroll animations respect `prefers-reduced-motion`; the page renders fully without JavaScript
- All forms (quote, contact, newsletter) are front-end demos only — they validate and show a confirmation, but do not send data
- Contact details on `contact.html` (email, phone) and the articles on `news.html` are placeholders — replace them with real content before publishing

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Gộp component theo BỐ CỤC: 36 component đặt tên theo nội dung → 15 component
 * đặt tên theo hình dạng, biến thể là `metadata.layout`. Mọi section giữ nguyên
 * id, section_key (id neo), heading/nội dung; chỉ đổi `metadata`:
 *
 *  1. `_component` = tên component mới (mọi section đều ghi rõ, kể cả trang chuẩn
 *     trước đây render theo key), `layout` = bố cục tương ứng tên cũ.
 *  2. Danh sách chính đổi về `items` (configurations / reasons / audiences /
 *     checklist / documents / photos / sizes / steps / cards / varieties / formats…);
 *     danh sách chuỗi được nâng thành object; incoterms → chips.
 *  3. Chữ / ảnh / nút trước đây viết cứng trong component (CTA hero, ảnh kho + tàu,
 *     câu mục tiêu, ghi chú liên hệ, mô tả 6 giống trang Products…) được ghi vào
 *     metadata để website hiển thị y như cũ và admin sửa được.
 *  4. Trang home: đổi key để menu (/#about-map, /#how-it-works) trỏ đúng section
 *     ĐANG BẬT — bản đang tắt được đổi sang key `-pins` / `-slider`.
 *  5. Tiêu đề hero trang Contact ("Let’s Talk Almonds") từng viết cứng trong code
 *     → ghi vào Admin → Trang Liên hệ (site_settings.contactPage.hero.title) nếu trống.
 *
 * Không xoá section nào. `down()` khôi phục `_component` theo tên cũ và key trang
 * home; cấu trúc dữ liệu (items…) giữ theo bản mới.
 */

type Meta = Record<string, unknown>;
type Rule = { component: string; layout?: string; transform?: (m: Meta) => void };

const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0) : [];
const objList = (v: unknown): Meta[] =>
  Array.isArray(v) ? v.filter((x): x is Meta => !!x && typeof x === 'object') : [];
const missing = (m: Meta, key: string) =>
  m[key] === undefined || m[key] === null || m[key] === '';
const setDefault = (m: Meta, key: string, value: unknown) => {
  if (missing(m, key)) m[key] = value;
};
/** Đổi tên key; đã có key mới thì giữ key mới, bỏ key cũ. */
const rename = (m: Meta, from: string, to: string) => {
  if (from === to) return;
  if (m[from] !== undefined && missing(m, to)) m[to] = m[from];
  delete m[from];
};
/** Mảng (chuỗi hoặc object) → mảng object; chuỗi thành {[field]: chuỗi}. */
const toObjects = (v: unknown, field = 'title'): Meta[] =>
  Array.isArray(v)
    ? v
        .map((x) => (typeof x === 'string' ? (x.trim() ? { [field]: x.trim() } : null) : x && typeof x === 'object' ? x : null))
        .filter((x): x is Meta => !!x)
    : [];
const listToItems = (m: Meta, from: string, field = 'title') => {
  if (missing(m, 'items') && m[from] !== undefined) m.items = toObjects(m[from], field);
  delete m[from];
};

/* ---------- Nội dung từng viết cứng trong component ---------- */

const VARIETY_DEFAULTS: Record<string, { text: string; image: string }> = {
  Nonpareil: { text: 'Known for its light color, smooth surface, attractive appearance, and broad range of commercial applications.', image: '/images/almonds-ramekin.webp' },
  Independence: { text: 'A widely available California variety suitable for wholesale, roasting, processing, and ingredient applications.', image: '/images/almonds-table.webp' },
  'Carmel-Type Almonds': { text: 'Versatile almonds commonly selected for processing, roasting, and food manufacturing.', image: '/images/kernels-study.jpg' },
  'California-Type Almonds': { text: 'Commercial varieties available in multiple sizes and specifications, depending on the crop and current market availability.', image: '/images/green-almond.jpg' },
};
const CIRCLE_IMAGES = ['/images/almonds-ramekin.webp', '/images/almonds-table.webp', '/images/kernels-study.jpg', '/images/green-almond.jpg'];

const NATURAL: Meta[] = [
  { title: 'Nonpareil', text: 'The flagship California variety — light color and a smooth, attractive kernel, the benchmark for premium snacking and retail programs.', image: '/images/products/nonpareil.jpg', imagePosition: 'center 64%' },
  { title: 'Independence', text: 'A widely planted modern variety with an appealing, versatile kernel — a dependable option for snacking and blanching alike.', image: '/images/products/independence.jpg', imagePosition: '64% 64%' },
  { title: 'Monterey', text: 'A larger, elongated kernel and a dependable workhorse for industrial, ingredient, and manufacturing use.', image: '/images/products/monterey.jpg', imagePosition: 'center' },
  { title: 'Carmel', text: 'A versatile kernel well suited to roasting, blanching, and a broad range of food-manufacturing applications.', image: '/images/products/carmel.jpg', imagePosition: 'center 68%' },
  { title: 'Butte', text: 'A smaller, rounded Mission-type kernel — popular for snack mixes, roasting, and export markets where compact sizes are preferred.', image: '/images/products/butte.jpg', imagePosition: 'center' },
  { title: 'Padre', text: 'A hardy Mission-type variety with a plump kernel and rich flavor — well suited to roasting, dicing, and processed applications.', image: '/images/products/padre.jpg', imagePosition: '55% center' },
];

const PROCESSED: Meta[] = [
  { title: 'Blanched', text: 'Whole kernels with skins removed — clean, ivory color for marzipan, confectionery, and premium bakery use.', image: '/images/products/blanched.jpg', icon: 'blanched' },
  { title: 'Sliced', text: 'Thin, uniform slices — natural or blanched — for bakery toppings, cereals, salads, and garnishes.', image: '/images/products/sliced.jpg', icon: 'sliced' },
  { title: 'Slivered', text: 'Julienne-cut blanched kernels — a classic format for baking, rice dishes, pilafs, and garnish.', image: '/images/products/slivered.jpg', imagePosition: 'center 5%', icon: 'slivered' },
  { title: 'Diced', text: 'Uniform pieces in a range of cut sizes — ideal for chocolate and candy inclusions, ice cream, and granola.', image: '/images/products/diced.jpg', icon: 'diced' },
  { title: 'Almond Flour & Meal', text: 'Finely ground blanched flour and natural meal — for gluten-free baking, macarons, coatings, and ingredient blends.', image: '/images/products/almond-flour.jpg', icon: 'flour' },
  { title: 'Custom Specifications', text: 'Other cuts, grades, and preparations can be evaluated according to your application and destination market.', image: '/images/products/custom-specifications.jpg', icon: 'tune' },
];

const STEP_TEXTS: Record<string, string> = {
  'Send Your Requirements': 'Provide the variety, size, grade, quantity, packaging, destination port, preferred shipment date, and Incoterm.',
  'We Source in California': 'Our team reviews available supply and identifies options that match your product and commercial requirements.',
  'Review the Offer': 'You receive the applicable product specifications, pricing, packing details, commercial terms, and estimated availability.',
  'Confirm the Order': 'Once the terms are agreed upon, we coordinate the order, documentation, and required arrangements with the appropriate suppliers and logistics partners.',
  'Coordinate Shipment': 'Prime Nuts USA follows the order through export preparation, container coordination, and cargo dispatch.',
};

const SPEC_ICONS: Record<string, string> = {
  Product: 'product', Origin: 'pin', Varieties: 'leaf', Sizes: 'ruler',
  Grades: 'grade', Crop: 'calendar', Packaging: 'box', Volume: 'pallet',
};
const SPEC_ICON_ORDER = ['product', 'pin', 'leaf', 'ruler', 'grade', 'calendar', 'box', 'pallet'];
const WHY_ICONS = ['pin', 'tune', 'scale', 'ship', 'heart'];

const SCALE_NOTE = 'Custom sizes & grades on request';

const heroCtas = (m: Meta) => {
  setDefault(m, 'ctaLabel', 'Request a Quote');
  setDefault(m, 'ctaHref', '#request-quote');
  setDefault(m, 'cta2Label', 'Send Your Specifications');
  setDefault(m, 'cta2Href', '#product-specs');
};
const sizesToItems = (m: Meta) => {
  rename(m, 'sizes', 'items');
  setDefault(m, 'scaleNote', SCALE_NOTE);
};
const chainToItems = (m: Meta) => {
  if (missing(m, 'items')) {
    const chain = strList(m.chain);
    if (chain.length > 0) m.items = chain.map((title) => ({ title, text: STEP_TEXTS[title] ?? '' }));
  }
  delete m.chain;
};
const docsToItems = (m: Meta) => {
  listToItems(m, 'documents', 'label');
  rename(m, 'incoterms', 'chips');
};
const namedCatalog = (m: Meta, from: string, catalog: Meta[]) => {
  if (missing(m, 'items')) {
    const names = strList(m[from]);
    const source = names.length > 0 ? names : catalog.map((x) => x.title as string);
    m.items = source.map((name) => catalog.find((x) => x.title === name) ?? { title: name });
  }
  delete m[from];
};

/** Tên component cũ (metadata._component hoặc section_key) → component mới + chuyển dữ liệu. */
const RULES: Record<string, Rule> = {
  'hero-slider': { component: 'hero', layout: 'slider', transform: heroCtas },
  'hero-stats': {
    component: 'hero', layout: 'static',
    transform: (m) => { heroCtas(m); setDefault(m, 'image', '/images/orchard-rows.jpg'); },
  },
  'about-map': { component: 'about-map', layout: 'pins' },
  'markets-map': { component: 'about-map', layout: 'pins' },
  'about-map-regions': { component: 'about-map', layout: 'regions' },

  'almond-varieties': {
    component: 'media-cards', layout: 'circles',
    transform: (m) => {
      if (missing(m, 'items')) {
        m.items = strList(m.varieties).map((title, i) => ({
          title,
          text: VARIETY_DEFAULTS[title]?.text ?? '',
          image: VARIETY_DEFAULTS[title]?.image ?? CIRCLE_IMAGES[i % CIRCLE_IMAGES.length],
        }));
      }
      delete m.varieties;
    },
  },
  'variety-circles': { component: 'media-cards', layout: 'circles', transform: (m) => listToItems(m, 'varieties') },
  'almond-variety-cards': {
    component: 'media-cards', layout: 'toggle',
    transform: (m) => {
      if (missing(m, 'items')) {
        m.items = objList(m.cards).map((c) => ({ title: c.title, short: c.short, text: c.detail ?? c.text, image: c.image }));
      }
      delete m.cards;
    },
  },
  'products-overview': { component: 'media-cards', layout: 'names', transform: (m) => listToItems(m, 'varieties') },
  'name-cards': {
    component: 'media-cards', layout: 'names',
    transform: (m) => {
      const names = strList(m.varieties).length > 0 ? strList(m.varieties) : strList(m.formats);
      if (missing(m, 'items')) m.items = toObjects(names);
      delete m.varieties; delete m.formats;
    },
  },
  'natural-almonds': {
    component: 'media-cards', layout: 'photo',
    transform: (m) => {
      namedCatalog(m, 'varieties', NATURAL);
      setDefault(m, 'image', '/images/almonds-ramekin.webp');
      setDefault(m, 'imageAlt', 'Raw natural almond kernels in a white ramekin on a wooden board');
      setDefault(m, 'itemLabel', 'Variety');
    },
  },
  'processed-almonds': {
    component: 'media-cards', layout: 'badge',
    transform: (m) => {
      namedCatalog(m, 'formats', PROCESSED);
      setDefault(m, 'photos', [
        { image: '/images/almond-tart.webp', caption: 'Almond flour & bakery applications' },
        { image: '/images/kernels-study.jpg', caption: 'In-shell, natural & blanched kernels' },
      ]);
      setDefault(m, 'note', '<strong>Product selection</strong> is based on variety, grade, size, crop year, specifications, packaging, and intended application.');
      setDefault(m, 'itemLabel', 'Format');
    },
  },

  'kernel-sizes': {
    component: 'size-scale', layout: 'section',
    transform: (m) => {
      sizesToItems(m);
      setDefault(m, 'footnote', 'Different grades, varieties and specifications may be available depending on crop and market conditions.');
    },
  },
  'size-grid': { component: 'size-scale', layout: 'section', transform: sizesToItems },
  'sizes-band': { component: 'size-scale', layout: 'band', transform: sizesToItems },
  'photo-strip': { component: 'photo-strip', transform: (m) => rename(m, 'photos', 'items') },

  'product-specs': {
    component: 'icon-card-list', layout: 'split',
    transform: (m) => {
      if (missing(m, 'items')) {
        m.items = toObjects(m.configurations).map((row, i) => ({
          ...row,
          icon: row.icon ?? SPEC_ICONS[String(row.title)] ?? SPEC_ICON_ORDER[i % SPEC_ICON_ORDER.length],
        }));
      }
      delete m.configurations;
      setDefault(m, 'ctaLabel', 'Send Your Specifications');
      setDefault(m, 'ctaHref', '#request-quote');
      setDefault(m, 'image', '/images/bulk-warehouse.jpg');
      setDefault(m, 'imageAlt', 'Palletized cartons stored in a commercial warehouse');
      setDefault(m, 'image2', '/images/ship-color.webp');
      setDefault(m, 'image2Alt', 'Container ship being loaded at a port terminal');
      setDefault(m, 'badge', '50 lb|Cartons');
    },
  },
  'icon-card-list': { component: 'icon-card-list', layout: 'list', transform: (m) => listToItems(m, 'configurations') },

  'how-it-works': {
    component: 'steps', layout: 'slider',
    transform: (m) => {
      chainToItems(m);
      setDefault(m, 'ctaLabel', 'Start a Sourcing Request');
      setDefault(m, 'ctaHref', '#request-quote');
    },
  },
  'slider-chain': { component: 'steps', layout: 'slider', transform: chainToItems },
  'working-process': { component: 'steps', layout: 'circles', transform: (m) => rename(m, 'steps', 'items') },

  'sourcing-services': {
    component: 'feature-list', layout: 'split',
    transform: (m) => {
      docsToItems(m);
      setDefault(m, 'image', '/images/container-ship.jpg');
      setDefault(m, 'note', 'Our objective is simple: to make purchasing California almonds more efficient, transparent, and reliable for international buyers.');
    },
  },
  'doc-grid': {
    component: 'feature-list', layout: 'grid',
    transform: (m) => {
      docsToItems(m);
      if (strList(m.chips).length > 0) {
        setDefault(m, 'note', 'Shipping quotations may be available under common international trade terms:');
      }
    },
  },

  'buyers-marquee': { component: 'marquee', transform: (m) => rename(m, 'audiences', 'items') },
  marquee: { component: 'marquee', transform: (m) => rename(m, 'audiences', 'items') },

  'why-us': {
    component: 'feature-cards',
    transform: (m) => {
      if (missing(m, 'items')) {
        m.items = toObjects(m.reasons).map((row, i) => ({ ...row, icon: row.icon ?? WHY_ICONS[i % WHY_ICONS.length] }));
      }
      delete m.reasons;
    },
  },
  'why-cards': { component: 'feature-cards', transform: (m) => listToItems(m, 'reasons') },

  faq: { component: 'faq', layout: 'columns' },
  'faq-split': {
    component: 'faq', layout: 'split',
    transform: (m) => {
      setDefault(m, 'image', '/images/kernels-study.jpg');
      setDefault(m, 'imageAlt', 'California almonds');
    },
  },

  'request-quote': {
    component: 'quote-form',
    transform: (m) => {
      rename(m, 'checklist', 'items');
      setDefault(m, 'note', 'Prime Nuts USA · California, USA — Wholesale and trade inquiries only.');
    },
  },
  'quote-cta': { component: 'quote-form', transform: (m) => rename(m, 'checklist', 'items') },

  'quote-checklist': {
    component: 'checklist',
    transform: (m) => {
      rename(m, 'checklist', 'items');
      setDefault(m, 'note', 'Prefer a structured form? Use the detailed <a href="/#request-quote">B2B quote request form</a> on our home page.');
    },
  },
  checklist: { component: 'checklist', transform: (m) => rename(m, 'checklist', 'items') },

  'contact-details': {
    component: 'contact', layout: 'form',
    transform: (m) => {
      // Thông tin liên hệ seed cũ chưa từng hiển thị (component đọc Admin → Trang Liên hệ).
      delete m.location; delete m.address; delete m.email; delete m.phone;
      setDefault(m, 'note', 'We typically respond to commercial inquiries within 1–2 business days. For the fastest quotation, include your target variety, size &amp; grade, volume, packaging, destination port, and preferred Incoterm.');
      setDefault(m, 'image', '/images/orchard-rows.jpg');
      setDefault(m, 'imageAlt', 'Rows of almond trees in a California orchard');
    },
  },
  'contact-info': { component: 'contact', layout: 'list' },
  stats: { component: 'stats' },
};

/** Đoạn intro seed cũ của contact-details có cả câu "respond within 1–2 days" (giờ nằm ở ghi chú). */
const CONTACT_SEED_CONTENT =
  '<p>We work with commercial buyers — importers, distributors, wholesalers, food manufacturers, roasters, and private-label brands. We typically respond to commercial inquiries within 1–2 business days.</p>';
const CONTACT_HERO_TITLE = 'Let’s Talk Almonds';
const CONTACT_INTRO =
  '<p>We work with commercial buyers — importers, distributors, wholesalers, food manufacturers, roasters, and private-label brands.</p>';

/** Bản mới (component, layout) → tên cũ, dùng cho down(). */
const REVERSE: Array<[string, string | undefined, string]> = [
  ['hero', 'slider', 'hero-slider'], ['hero', 'static', 'hero-stats'],
  ['about-map', 'pins', 'about-map'], ['about-map', 'regions', 'about-map-regions'],
  ['media-cards', 'circles', 'variety-circles'], ['media-cards', 'toggle', 'almond-variety-cards'],
  ['media-cards', 'names', 'name-cards'], ['media-cards', 'photo', 'natural-almonds'],
  ['media-cards', 'badge', 'processed-almonds'],
  ['size-scale', 'section', 'kernel-sizes'], ['size-scale', 'band', 'sizes-band'],
  ['photo-strip', undefined, 'photo-strip'],
  ['icon-card-list', 'split', 'product-specs'], ['icon-card-list', 'list', 'icon-card-list'],
  ['steps', 'slider', 'how-it-works'], ['steps', 'circles', 'working-process'],
  ['feature-list', 'split', 'sourcing-services'], ['feature-list', 'grid', 'doc-grid'],
  ['marquee', undefined, 'buyers-marquee'], ['feature-cards', undefined, 'why-us'],
  ['faq', 'columns', 'faq'], ['faq', 'split', 'faq-split'],
  ['quote-form', undefined, 'request-quote'], ['checklist', undefined, 'quote-checklist'],
  ['contact', 'form', 'contact-details'], ['contact', 'list', 'contact-info'],
  ['stats', undefined, 'stats'],
];

/** [key chuẩn (menu trỏ vào), key của bản đang bật, key mới cho bản đang tắt] */
const HOME_KEY_SWAPS: Array<[string, string, string]> = [
  ['about-map', 'about-map-regions', 'about-map-pins'],
  ['how-it-works', 'working-process', 'how-it-works-slider'],
];

type Row = { id: number; sectionKey: string; content: string | null; metadata: unknown; isActive: number; slug: string };

const parseMeta = (raw: unknown): Meta => {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as Meta; } catch { return {}; }
  }
  return typeof raw === 'object' ? { ...(raw as Meta) } : {};
};

export class LayoutComponents1789500000000 implements MigrationInterface {
  name = 'LayoutComponents1789500000000';

  private async rows(queryRunner: QueryRunner): Promise<Row[]> {
    return queryRunner.query(
      `SELECT ps.\`id\`, ps.\`section_key\` AS sectionKey, ps.\`content\`, ps.\`metadata\`,
              ps.\`is_active\` AS isActive, p.\`slug\`
       FROM \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\``,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const row of await this.rows(queryRunner)) {
      const m = parseMeta(row.metadata);
      const oldKey = typeof m._component === 'string' && m._component ? m._component : row.sectionKey;
      const rule = RULES[oldKey];
      if (!rule) continue;

      rule.transform?.(m);
      m._component = rule.component;
      if (rule.layout && typeof m.layout !== 'string') m.layout = rule.layout;

      await queryRunner.query(`UPDATE \`page_sections\` SET \`metadata\` = ? WHERE \`id\` = ?`, [
        JSON.stringify(m),
        row.id,
      ]);

      if (oldKey === 'contact-details' && row.content === CONTACT_SEED_CONTENT) {
        await queryRunner.query(`UPDATE \`page_sections\` SET \`content\` = ? WHERE \`id\` = ?`, [CONTACT_INTRO, row.id]);
      }
    }

    // Tiêu đề hero trang Contact — trước đây viết cứng trong code.
    const settings: Array<{ value: unknown }> = await queryRunner.query(
      `SELECT \`value\` FROM \`site_settings\` WHERE \`key\` = 'contactPage' LIMIT 1`,
    );
    if (settings.length === 0) {
      await queryRunner.query(
        `INSERT INTO \`site_settings\` (\`key\`, \`value\`, \`updated_at\`) VALUES ('contactPage', ?, NOW(6))`,
        [JSON.stringify({ hero: { title: CONTACT_HERO_TITLE } })],
      );
    } else {
      const value = parseMeta(settings[0].value);
      const hero = parseMeta(value.hero);
      if (missing(hero, 'title')) {
        value.hero = { ...hero, title: CONTACT_HERO_TITLE };
        await queryRunner.query(
          `UPDATE \`site_settings\` SET \`value\` = ? WHERE \`key\` = 'contactPage'`,
          [JSON.stringify(value)],
        );
      }
    }

    // Menu trang chủ trỏ vào key chuẩn → key đó phải là bản đang bật.
    const home = (await this.rows(queryRunner)).filter((row) => row.slug === 'home');
    for (const [canonical, variant, parked] of HOME_KEY_SWAPS) {
      const canonRow = home.find((row) => row.sectionKey === canonical);
      const variantRow = home.find((row) => row.sectionKey === variant);
      if (!variantRow || (canonRow && canonRow.isActive)) continue;
      if (home.some((row) => row.sectionKey === parked)) continue;
      if (canonRow) {
        await queryRunner.query(`UPDATE \`page_sections\` SET \`section_key\` = ? WHERE \`id\` = ?`, [parked, canonRow.id]);
      }
      await queryRunner.query(`UPDATE \`page_sections\` SET \`section_key\` = ? WHERE \`id\` = ?`, [canonical, variantRow.id]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const home = (await this.rows(queryRunner)).filter((row) => row.slug === 'home');
    for (const [canonical, variant, parked] of HOME_KEY_SWAPS) {
      const parkedRow = home.find((row) => row.sectionKey === parked);
      const canonRow = home.find((row) => row.sectionKey === canonical);
      if (!parkedRow || !canonRow || home.some((row) => row.sectionKey === variant)) continue;
      await queryRunner.query(`UPDATE \`page_sections\` SET \`section_key\` = ? WHERE \`id\` = ?`, [variant, canonRow.id]);
      await queryRunner.query(`UPDATE \`page_sections\` SET \`section_key\` = ? WHERE \`id\` = ?`, [canonical, parkedRow.id]);
    }

    for (const row of await this.rows(queryRunner)) {
      const m = parseMeta(row.metadata);
      if (typeof m._component !== 'string') continue;
      const layout = typeof m.layout === 'string' ? m.layout : undefined;
      const match =
        REVERSE.find(([component, l]) => component === m._component && l === layout) ??
        REVERSE.find(([component]) => component === m._component);
      if (!match) continue;
      m._component = match[2];
      await queryRunner.query(`UPDATE \`page_sections\` SET \`metadata\` = ? WHERE \`id\` = ?`, [
        JSON.stringify(m),
        row.id,
      ]);
    }
  }
}

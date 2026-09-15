import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Chuẩn hoá tên section — mỗi khối trên trang chuẩn có đúng MỘT tên, dùng chung cho:
 * section_key = file component (frontend/src/app/(site)/_components/sections/<Tên>.tsx)
 * = id neo trên trang = key trong section_definitions.
 *
 * 1. Xoá section thử nghiệm không còn dùng trên trang home (home-hero, almonds…).
 * 2. Trang tự tạo đang dùng component cũ → `_component` trỏ sang tên component
 *    thư viện (stats, icon-card-list…) để hiển thị giữ nguyên.
 * 3. Trang chuẩn (home/products/contact): bỏ `_component` (render theo key) và đổi key.
 * 4. Đổi link menu (/#markets → /#about-map…).
 * 5. Xoá danh mục component cũ — `db:seed` tạo lại theo code (deploy.sh chạy ngay sau).
 *
 * Dùng hàm JSON của MySQL/MariaDB.
 */

const STANDARD_PAGES = ['home', 'products', 'contact'];

/** Section thử nghiệm của bản thiết kế đã bỏ — chỉ có ở DB dev. */
const UNUSED_HOME_KEYS = [
  'home-hero', 'almonds', 'specifications', 'procurement', 'how-it-works',
  'buyers', 'why-choose', 'about', 'request-quote', 'process-steps',
];

/** [slug trang, key cũ, key mới] */
const PAGE_KEY_RENAMES: Array<[string, string, string]> = [
  ['home', 'hero', 'hero-stats'],
  ['home', 'markets', 'about-map'],
  ['home', 'products-overview', 'almond-varieties'],
  ['home', 'orders', 'product-specs'],
  ['home', 'sourcing', 'how-it-works'],
  ['home', 'logistics', 'sourcing-services'],
  ['home', 'who-we-serve', 'buyers-marquee'],
  ['home', 'quote-cta', 'request-quote'],
  ['contact', 'contact-info', 'contact-details'],
  ['contact', 'quotation-checklist', 'quote-checklist'],
];

/** Loại component cũ → tên component thư viện (tên file dạng kebab-case). */
const COMPONENT_RENAMES: Array<[string, string]> = [
  ['hero', 'stats'],
  ['markets', 'markets-map'],
  ['orders', 'icon-card-list'],
  ['sourcing', 'slider-chain'],
  ['logistics', 'doc-grid'],
  ['who-we-serve', 'marquee'],
  ['why-us', 'why-cards'],
  ['natural-almonds', 'name-cards'],
  ['processed-almonds', 'name-cards'],
  ['kernel-sizes', 'size-grid'],
  ['quotation-checklist', 'checklist'],
  // products-overview, quote-cta, contact-info, working-process: tên giữ nguyên.
];

const MENU_HREF_RENAMES: Array<[string, string]> = [
  ['/#markets', '/#about-map'],
  ['/#products', '/#almond-varieties'],
  ['/#orders', '/#product-specs'],
  ['/#sourcing', '/#how-it-works'],
  ['/#logistics', '/#sourcing-services'],
  ['/#serve', '/#buyers-marquee'],
  ['/#why', '/#why-us'],
  ['/#quote', '/#request-quote'],
  ['/products#natural', '/products#natural-almonds'],
  ['/products#processed', '/products#processed-almonds'],
  ['/products#sizes', '/products#kernel-sizes'],
];

const inList = (values: string[]) => values.map(() => '?').join(', ');

export class StandardizeSectionKeys1789460000000 implements MigrationInterface {
  name = 'StandardizeSectionKeys1789460000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Section thử nghiệm không còn dùng.
    await queryRunner.query(
      `DELETE ps FROM \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
       WHERE p.\`slug\` = 'home' AND ps.\`section_key\` IN (${inList(UNUSED_HOME_KEYS)})`,
      UNUSED_HOME_KEYS,
    );

    // 2. Trang tự tạo: giữ nguyên hiển thị bằng tên component thư viện.
    for (const [from, to] of COMPONENT_RENAMES) {
      await queryRunner.query(
        `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
         SET ps.\`metadata\` = JSON_SET(ps.\`metadata\`, '$._component', ?)
         WHERE p.\`slug\` NOT IN (${inList(STANDARD_PAGES)})
           AND JSON_UNQUOTE(JSON_EXTRACT(ps.\`metadata\`, '$._component')) = ?`,
        [to, ...STANDARD_PAGES, from],
      );
      // Section không lưu `_component` thì trước đây render theo key → ghi rõ loại.
      await queryRunner.query(
        `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
         SET ps.\`metadata\` = JSON_SET(COALESCE(ps.\`metadata\`, JSON_OBJECT()), '$._component', ?)
         WHERE p.\`slug\` NOT IN (${inList(STANDARD_PAGES)})
           AND ps.\`section_key\` = ?
           AND (ps.\`metadata\` IS NULL OR JSON_EXTRACT(ps.\`metadata\`, '$._component') IS NULL)`,
        [to, ...STANDARD_PAGES, from],
      );
    }

    // 3. Trang chuẩn: render theo key → bỏ `_component`, rồi đổi key.
    await queryRunner.query(
      `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
       SET ps.\`metadata\` = JSON_REMOVE(ps.\`metadata\`, '$._component')
       WHERE p.\`slug\` IN (${inList(STANDARD_PAGES)})
         AND JSON_EXTRACT(ps.\`metadata\`, '$._component') IS NOT NULL`,
      STANDARD_PAGES,
    );
    for (const [slug, from, to] of PAGE_KEY_RENAMES) {
      await queryRunner.query(
        `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
         SET ps.\`section_key\` = ?
         WHERE p.\`slug\` = ? AND ps.\`section_key\` = ?`,
        [to, slug, from],
      );
    }

    // 4. Link menu.
    for (const [from, to] of MENU_HREF_RENAMES) {
      await queryRunner.query(`UPDATE \`menu_items\` SET \`href\` = ? WHERE \`href\` = ?`, [to, from]);
    }

    // 5. Danh mục component do code quản lý — seed tạo lại.
    await queryRunner.query(`DELETE FROM \`section_definitions\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [from, to] of MENU_HREF_RENAMES) {
      await queryRunner.query(`UPDATE \`menu_items\` SET \`href\` = ? WHERE \`href\` = ?`, [from, to]);
    }

    for (const [slug, from, to] of PAGE_KEY_RENAMES) {
      await queryRunner.query(
        `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
         SET ps.\`section_key\` = ?
         WHERE p.\`slug\` = ? AND ps.\`section_key\` = ?`,
        [from, slug, to],
      );
    }

    // name-cards từng ứng với 2 loại cũ — khôi phục về natural-almonds (gần đúng).
    const reversed = new Map<string, string>();
    for (const [from, to] of COMPONENT_RENAMES) if (!reversed.has(to)) reversed.set(to, from);
    for (const [to, from] of reversed) {
      await queryRunner.query(
        `UPDATE \`page_sections\` ps INNER JOIN \`pages\` p ON p.\`id\` = ps.\`page_id\`
         SET ps.\`metadata\` = JSON_SET(ps.\`metadata\`, '$._component', ?)
         WHERE p.\`slug\` NOT IN (${inList(STANDARD_PAGES)})
           AND JSON_UNQUOTE(JSON_EXTRACT(ps.\`metadata\`, '$._component')) = ?`,
        [from, ...STANDARD_PAGES, to],
      );
    }

    await queryRunner.query(`DELETE FROM \`section_definitions\``);
  }
}

import 'reflect-metadata';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { PAGES, type PageDefinition } from 'src/database/seeding/seeds/page.seed';

/**
 * Sinh bản DỰ PHÒNG cho frontend từ seed nội dung (nguồn nội dung duy nhất):
 *   npm run content:export
 * → frontend-next/src/content/cms-fallback.json — website dùng khi API CMS lỗi.
 * Chạy lại mỗi khi sửa page.seed.ts (không sửa tay file JSON).
 */

const STAMP = '2026-01-01T00:00:00.000Z';
const SLUGS = ['home', 'products', 'contact'];

let nextId = 1;
const out: Record<string, unknown> = {};

for (const definition of PAGES as PageDefinition[]) {
  const { page, sections } = definition;
  if (!SLUGS.includes(page.slug)) continue;
  const pageId = nextId++;
  out[page.slug] = {
    id: pageId,
    title: page.title,
    slug: page.slug,
    status: page.status ?? 'published',
    eyebrow: page.eyebrow ?? null,
    lead: page.lead ?? null,
    templateKey: page.templateKey ?? null,
    sortOrder: page.sortOrder ?? 0,
    metaTitle: page.metaTitle ?? null,
    metaDescription: page.metaDescription ?? null,
    ogImagePath: null,
    canonicalUrl: null,
    createdAt: STAMP,
    updatedAt: STAMP,
    deletedAt: null,
    translations: null,
    sections: sections.map((section: PageDefinition['sections'][number], index: number) => ({
      id: nextId++,
      pageId,
      sectionKey: section.sectionKey,
      heading: section.heading ?? null,
      subheading: section.subheading ?? null,
      content: section.content ?? null,
      mediaPath: section.mediaPath ?? null,
      metadata: section.metadata ?? null,
      isActive: section.isActive ?? true,
      sortOrder: section.sortOrder ?? index + 1,
      createdAt: STAMP,
      updatedAt: STAMP,
      deletedAt: null as null,
      translations: null as null,
    })),
  };
}

const target = resolve(__dirname, '../../../frontend-next/src/content/cms-fallback.json');
writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${Object.keys(out).length} page(s) → ${target}`);

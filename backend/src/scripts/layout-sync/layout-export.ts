import 'reflect-metadata';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';
import {
  DEFAULT_LAYOUT_FILE,
  type LayoutFile,
  LayoutSyncModule,
  argValue,
  collectUploadPaths,
  normalizeUrls,
} from './layout-sync.shared';

/**
 * Xuất bố cục trang từ database hiện tại (thường là máy dev) ra file JSON:
 *   npm run layout:export                          → mọi trang
 *   npm run layout:export -- --pages=home,contact  → chỉ vài trang
 *   npm run layout:export -- --file=duong/dan.json
 * Commit + push file này, trên VPS chạy `npm run layout:import`.
 */
async function main() {
  const fileArg = argValue('file');
  const file = fileArg ? resolve(fileArg) : DEFAULT_LAYOUT_FILE;
  const onlySlugs = argValue('pages')
    ?.split(',')
    .map((slug) => slug.trim())
    .filter(Boolean);

  const app = await NestFactory.createApplicationContext(LayoutSyncModule, {
    logger: ['error', 'warn'],
  });
  try {
    const pageRepo = app.get<Repository<Page>>(getRepositoryToken(Page));
    const sectionRepo = app.get<Repository<PageSection>>(
      getRepositoryToken(PageSection),
    );

    const pages = await pageRepo.find({
      where: onlySlugs?.length ? { slug: In(onlySlugs) } : {},
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    const layout: LayoutFile = {
      exportedAt: new Date().toISOString(),
      pages: [],
    };
    for (const page of pages) {
      const sections = await sectionRepo.find({
        where: { pageId: page.id },
        order: { sortOrder: 'ASC', id: 'ASC' },
      });
      layout.pages.push(
        normalizeUrls({
          slug: page.slug,
          title: page.title,
          heroImagePath: page.heroImagePath ?? null,
          heroImagePosition: page.heroImagePosition ?? null,
          sections: sections.map((section) => ({
            sectionKey: section.sectionKey,
            component:
              typeof section.metadata?._component === 'string'
                ? section.metadata._component
                : section.sectionKey,
            isActive: Boolean(section.isActive),
            sortOrder: section.sortOrder,
            heading: section.heading,
            subheading: section.subheading,
            content: section.content,
            mediaPath: section.mediaPath,
            metadata: section.metadata,
            translations: section.translations,
          })),
        }),
      );
    }

    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(layout, null, 2)}\n`);

    console.log(`Đã xuất ${layout.pages.length} trang → ${file}`);
    for (const page of layout.pages) {
      const active = page.sections
        .filter((section) => section.isActive)
        .map((section) => section.sectionKey);
      console.log(
        `  ${page.slug}: ${page.sections.length} section (${active.length} đang bật: ${active.join(', ') || '—'})`,
      );
    }

    // Ảnh dữ liệu trỏ tới phải nằm trong git thì VPS mới có (backend/uploads được version hoá).
    const missing = [...collectUploadPaths(layout)].filter((path) => {
      const onDisk = resolve(process.cwd(), path.slice(1));
      if (!existsSync(onDisk)) return true;
      try {
        execFileSync('git', ['ls-files', '--error-unmatch', path.slice(1)], {
          stdio: 'ignore',
        });
        return false;
      } catch {
        return true;
      }
    });
    if (missing.length > 0) {
      console.warn(
        `\n!! ${missing.length} ảnh chưa có trong git (VPS sẽ thiếu) — commit các file này cùng layout.json:`,
      );
      missing.forEach((path) => console.warn(`   backend${path}`));
    }
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

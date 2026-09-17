import 'reflect-metadata';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';
import { PageSectionsService } from 'src/modules/admin/pages/page-sections.service';
import {
  DEFAULT_LAYOUT_FILE,
  type ExportedSection,
  type LayoutFile,
  LayoutSyncModule,
  argValue,
  hasFlag,
} from './layout-sync.shared';

/**
 * Nhập bố cục trang từ layout-sync/layout.json vào database hiện tại (VPS):
 *   npm run layout:import                      → CHẠY THỬ: chỉ in kế hoạch, không ghi gì
 *   npm run layout:import -- --apply           → ghi vào database
 *   npm run layout:import -- --pages=home      → chỉ vài trang
 *   npm run layout:import -- --update-content  → ghi đè cả NỘI DUNG section đã có
 *
 * Mặc định cho từng section trong file:
 *   - chưa có trên VPS          → TẠO MỚI (kèm nội dung, qua kiểm tra metadata như admin)
 *   - đã có                     → chỉ chỉnh BẬT/TẮT + THỨ TỰ cho khớp, giữ nguyên nội dung
 *   - đã bị xoá trên VPS        → bỏ qua, báo lại
 * Section chỉ có trên VPS (không có trong file) → giữ nguyên, báo lại.
 * Ảnh nền đầu trang: file có giá trị thì đặt theo file.
 */

type Change = { label: string; apply: () => Promise<unknown> };

const onOff = (value: boolean) => (value ? 'bật' : 'tắt');

async function main() {
  const fileArg = argValue('file');
  const file = fileArg ? resolve(fileArg) : DEFAULT_LAYOUT_FILE;
  const apply = hasFlag('apply');
  const updateContent = hasFlag('update-content');
  const onlySlugs = argValue('pages')
    ?.split(',')
    .map((slug) => slug.trim())
    .filter(Boolean);

  if (!existsSync(file))
    throw new Error(
      `Không thấy file ${file} — ở máy dev chạy: npm run layout:export`,
    );
  const layout = JSON.parse(readFileSync(file, 'utf8')) as LayoutFile;

  const app = await NestFactory.createApplicationContext(LayoutSyncModule, {
    logger: ['error', 'warn'],
  });
  try {
    const pageRepo = app.get<Repository<Page>>(getRepositoryToken(Page));
    const sectionRepo = app.get<Repository<PageSection>>(
      getRepositoryToken(PageSection),
    );
    const sectionsService = app.get(PageSectionsService);

    console.log(`File: ${file} (xuất lúc ${layout.exportedAt})`);
    console.log(
      apply
        ? 'Chế độ: GHI VÀO DATABASE\n'
        : 'Chế độ: CHẠY THỬ — chưa ghi gì (thêm --apply để ghi)\n',
    );

    const changes: Change[] = [];

    for (const exported of layout.pages) {
      if (onlySlugs?.length && !onlySlugs.includes(exported.slug)) continue;

      const page = await pageRepo.findOne({ where: { slug: exported.slug } });
      if (!page) {
        console.log(
          `■ ${exported.slug}: KHÔNG có trang này trên máy đích — bỏ qua (tạo trang trong admin trước).\n`,
        );
        continue;
      }
      console.log(`■ ${exported.slug}`);
      const before = changes.length;

      const targetSections = await sectionRepo.find({
        where: { pageId: page.id },
        withDeleted: true,
      });
      const byKey = new Map(
        targetSections.map((section) => [section.sectionKey, section]),
      );

      for (const section of exported.sections) {
        const target = byKey.get(section.sectionKey);

        if (!target) {
          changes.push({
            label: `  + TẠO ${section.sectionKey} [${section.component}] · ${onOff(section.isActive)} · thứ tự ${section.sortOrder}`,
            apply: () =>
              sectionsService.create({
                ...contentOf(section),
                pageId: page.id,
                sectionKey: section.sectionKey,
              }),
          });
          continue;
        }
        if (target.deletedAt) {
          console.log(
            `  ! ${section.sectionKey}: đã bị xoá trên máy đích — bỏ qua`,
          );
          continue;
        }

        const patch: Partial<PageSection> = {};
        const notes: string[] = [];
        if (Boolean(target.isActive) !== section.isActive) {
          patch.isActive = section.isActive;
          notes.push(
            `${onOff(Boolean(target.isActive))} → ${onOff(section.isActive)}`,
          );
        }
        if (target.sortOrder !== section.sortOrder) {
          patch.sortOrder = section.sortOrder;
          notes.push(`thứ tự ${target.sortOrder} → ${section.sortOrder}`);
        }
        if (
          updateContent &&
          JSON.stringify(pickContent(target)) !==
            JSON.stringify(contentOf(section))
        ) {
          Object.assign(patch, contentOf(section));
          notes.push('ghi đè nội dung');
        }
        if (notes.length > 0) {
          changes.push({
            label: `  ~ SỬA ${section.sectionKey}: ${notes.join(', ')}`,
            apply: () =>
              patch.metadata !== undefined || patch.translations !== undefined
                ? sectionsService.update(target.id, patch)
                : sectionRepo.update(target.id, patch),
          });
        }
      }

      const exportedKeys = new Set(
        exported.sections.map((section) => section.sectionKey),
      );
      const onlyOnTarget = targetSections.filter(
        (section) =>
          !section.deletedAt && !exportedKeys.has(section.sectionKey),
      );
      for (const section of onlyOnTarget) {
        console.log(
          `  = GIỮ ${section.sectionKey} (chỉ có trên máy đích, ${onOff(Boolean(section.isActive))})`,
        );
      }

      if (
        exported.heroImagePath &&
        exported.heroImagePath !== page.heroImagePath
      ) {
        changes.push({
          label: `  ~ ẢNH NỀN ĐẦU TRANG: ${page.heroImagePath ?? '(mặc định)'} → ${exported.heroImagePath}`,
          apply: () =>
            pageRepo.update(page.id, {
              heroImagePath: exported.heroImagePath,
              heroImagePosition: exported.heroImagePosition,
            }),
        });
      }

      if (changes.length === before) console.log('  ✔ đã khớp, không cần đổi');
      else changes.slice(before).forEach((change) => console.log(change.label));
      console.log('');
    }

    if (changes.length === 0) {
      console.log('Không có gì cần thay đổi.');
      return;
    }
    if (!apply) {
      console.log(
        `${changes.length} thay đổi ở trên CHƯA được ghi. Kiểm tra xong chạy: npm run layout:import -- --apply`,
      );
      return;
    }

    for (const change of changes) {
      await change.apply();
      console.log(`✔${change.label.trimStart().slice(1)}`);
    }
    console.log(
      `\nĐã ghi ${changes.length} thay đổi. Website cập nhật sau ~3 phút (cache), muốn thấy ngay:` +
        '\n  pm2 restart primenutusa_api primenutusa_web',
    );
  } finally {
    await app.close();
  }
}

/** Các field nội dung của section trong file (để tạo mới / ghi đè). */
function contentOf(section: ExportedSection) {
  return {
    heading: section.heading,
    subheading: section.subheading,
    content: section.content,
    mediaPath: section.mediaPath,
    metadata: section.metadata,
    translations: section.translations,
    isActive: section.isActive,
    sortOrder: section.sortOrder,
  };
}

function pickContent(section: PageSection) {
  return {
    heading: section.heading,
    subheading: section.subheading,
    content: section.content,
    mediaPath: section.mediaPath,
    metadata: section.metadata,
    translations: section.translations,
    isActive: Boolean(section.isActive),
    sortOrder: section.sortOrder,
  };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

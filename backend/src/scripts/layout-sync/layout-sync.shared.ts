import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { AppConfigModule } from 'src/config/app-config.module';
import { DatabaseModule } from 'src/database/database.module';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';
import { SectionDefinition } from 'src/modules/admin/pages/entities/section-definition.entity';
import { PageSectionsService } from 'src/modules/admin/pages/page-sections.service';

/**
 * ĐỒNG BỘ BỐ CỤC TRANG giữa 2 database (VD máy dev → VPS).
 *
 * Git chỉ mang CODE; section nào có trên trang, bật/tắt, thứ tự, nội dung nằm
 * trong DATABASE nên không tự lên VPS. Hai script:
 *   npm run layout:export             (máy dev) → layout-sync/layout.json
 *   npm run layout:import             (VPS)     → xem trước thay đổi
 *   npm run layout:import -- --apply  (VPS)     → ghi vào database
 *
 * Nhập KHÔNG ghi đè nội dung section đã có trên VPS (trừ khi --update-content),
 * không đụng menu, logo, cài đặt, liên hệ / yêu cầu báo giá.
 */

export const DEFAULT_LAYOUT_FILE = resolve(
  process.cwd(),
  'layout-sync',
  'layout.json',
);

export type ExportedSection = {
  sectionKey: string;
  component: string;
  isActive: boolean;
  sortOrder: number;
  heading: string | null;
  subheading: string | null;
  content: string | null;
  mediaPath: string | null;
  metadata: Record<string, unknown> | null;
  translations: Record<string, Record<string, unknown>> | null;
};

export type ExportedPage = {
  slug: string;
  title: string;
  heroImagePath: string | null;
  heroImagePosition: string | null;
  sections: ExportedSection[];
};

export type LayoutFile = {
  exportedAt: string;
  pages: ExportedPage[];
};

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([Page, PageSection, SectionDefinition]),
  ],
  providers: [PageSectionsService],
})
export class LayoutSyncModule {}

/** Đọc `--name=value` từ dòng lệnh. */
export function argValue(name: string): string | undefined {
  const hit = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

export const hasFlag = (name: string) => process.argv.includes(`--${name}`);

/**
 * Link ảnh tuyệt đối của máy dev (http://localhost:3012/uploads/x.jpg) → đường
 * dẫn tương đối /uploads/x.jpg để chạy đúng trên domain thật.
 */
const LOCAL_UPLOAD_URL =
  /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/uploads\/)/;

export function normalizeUrls<T>(value: T): T {
  if (typeof value === 'string')
    return value.replace(LOCAL_UPLOAD_URL, '$1') as T;
  if (Array.isArray(value))
    return value.map((item) => normalizeUrls(item)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        normalizeUrls(item),
      ]),
    ) as T;
  }
  return value;
}

/** Mọi đường dẫn /uploads/... xuất hiện trong dữ liệu (để kiểm tra file ảnh có lên VPS không). */
export function collectUploadPaths(
  value: unknown,
  out = new Set<string>(),
): Set<string> {
  if (typeof value === 'string') {
    if (value.startsWith('/uploads/')) out.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectUploadPaths(item, out));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectUploadPaths(item, out));
  }
  return out;
}

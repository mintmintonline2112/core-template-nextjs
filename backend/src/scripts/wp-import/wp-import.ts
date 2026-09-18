import 'reflect-metadata';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { extname, resolve } from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfigModule } from 'src/config/app-config.module';
import { DatabaseModule } from 'src/database/database.module';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { BlogCategory } from 'src/modules/admin/blog-categories/entities/blog-category.entity';
import { BlogPost } from 'src/modules/admin/blog-posts/entities/blog-post.entity';

/**
 * KÉO NỘI DUNG TỪ WORDPRESS sang CMS này qua REST API công khai của WP
 * (`/wp-json/wp/v2/...`) — dùng khi chuyển một website WordPress sang khung này.
 *
 *   npm run wp:import -- --site=https://vi-du.com            → CHẠY THỬ, không ghi gì
 *   npm run wp:import -- --site=https://vi-du.com --apply    → ghi vào database
 *   npm run wp:import -- --site=... --apply --limit=5        → thử vài bài trước
 *   npm run wp:import -- --site=... --apply --skip-media     → không tải ảnh
 *   npm run wp:import -- --site=... --apply --draft          → nhập vào dạng nháp
 *
 * Nhập THEO SLUG và chỉ TẠO MỚI: bài/chuyên mục đã có trong database giữ nguyên,
 * chạy lại nhiều lần an toàn. Ảnh tải về `uploads/wp/`, link trong bài tự đổi
 * sang `/uploads/wp/...`; vào Thư viện bấm "Quét lại" để ảnh hiện trong admin.
 *
 * KHÔNG kéo: trang (page) của WordPress — layout của chúng do trình dựng trang
 * sinh ra, sang đây phải dựng lại bằng section nên kéo tự động vô nghĩa.
 */

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([BlogPost, BlogCategory]),
  ],
})
class WpImportModule {}

const argValue = (name: string): string | undefined => {
  const hit = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

/* ---------------------------------------------------------------- WP types */

type WpCategory = {
  id: number;
  slug: string;
  name: string;
  description: string;
  count: number;
  parent: number;
};

type WpPost = {
  id: number;
  slug: string;
  date_gmt: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  featured_media: number;
};

type WpMedia = { id: number; source_url: string; alt_text?: string };

/* ---------------------------------------------------------------- Helpers */

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

/** Giải mã &#8211; &amp; &quot;… trong tiêu đề/tóm tắt do WP trả về. */
function decodeEntities(html: string): string {
  return html
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITIES[name] ?? match);
}

const stripTags = (html: string) =>
  decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'user-agent': 'cms-wp-import' } });
  if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** Lấy hết các trang kết quả của một endpoint WP (tối đa 20 trang). */
async function fetchAll<T>(base: string, path: string): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= 20; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const batch = await fetchJson<T[]>(
      `${base}/wp-json/wp/v2/${path}${sep}per_page=50&page=${page}`,
    );
    out.push(...batch);
    if (batch.length < 50) break;
  }
  return out;
}

const UPLOAD_DIR = resolve(process.cwd(), 'uploads', 'wp');

/** Tải một ảnh về uploads/wp/, trả về đường dẫn public (hoặc null nếu lỗi). */
async function downloadImage(
  url: string,
  baseName: string,
): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'cms-wp-import' } });
    if (!res.ok || !res.body) return null;
    const ext = (extname(new URL(url).pathname) || '.jpg').toLowerCase();
    const fileName = `${baseName}${ext}`.replace(/[^a-z0-9._-]/gi, '-');
    const target = resolve(UPLOAD_DIR, fileName);
    if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
    if (!existsSync(target)) {
      await pipeline(
        Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]),
        createWriteStream(target),
      );
    }
    return `/uploads/wp/${fileName}`;
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------- Main */

async function main(): Promise<void> {
  const site = (argValue('site') ?? '').replace(/\/$/, '');
  if (!/^https?:\/\//.test(site)) {
    console.error(
      'Thiếu --site. Ví dụ: npm run wp:import -- --site=https://vi-du.com',
    );
    process.exit(1);
  }
  const apply = hasFlag('apply');
  const skipMedia = hasFlag('skip-media');
  const limit = Number(argValue('limit') ?? 0);
  const status = hasFlag('draft')
    ? PublishStatus.DRAFT
    : PublishStatus.PUBLISHED;

  console.log(`Nguồn: ${site}`);
  console.log(apply ? 'Chế độ: GHI VÀO DATABASE' : 'Chế độ: CHẠY THỬ (không ghi)');

  const app = await NestFactory.createApplicationContext(WpImportModule, {
    logger: ['error'],
  });
  const categoryRepo = app.get<Repository<BlogCategory>>(
    getRepositoryToken(BlogCategory),
  );
  const postRepo = app.get<Repository<BlogPost>>(getRepositoryToken(BlogPost));

  /* --- Chuyên mục --- */
  const wpCategories = (
    await fetchAll<WpCategory>(site, 'categories')
  ).filter((category) => category.count > 0);
  const idBySlug = new Map<string, number>();
  let createdCategories = 0;

  for (const [index, category] of wpCategories.entries()) {
    const existing = await categoryRepo.findOneBy({ slug: category.slug });
    if (existing) {
      idBySlug.set(category.slug, existing.id);
      continue;
    }
    console.log(`  + chuyên mục: ${category.name} (${category.count} bài)`);
    createdCategories++;
    if (!apply) continue;
    const saved = await categoryRepo.save(
      categoryRepo.create({
        name: decodeEntities(category.name),
        slug: category.slug,
        description: stripTags(category.description) || null,
        sortOrder: index + 1,
        isActive: true,
      }),
    );
    idBySlug.set(category.slug, saved.id);
  }

  const wpCategoryById = new Map(wpCategories.map((c) => [c.id, c]));

  /* --- Bài viết --- */
  let wpPosts = await fetchAll<WpPost>(site, 'posts?status=publish');
  if (limit > 0) wpPosts = wpPosts.slice(0, limit);

  let createdPosts = 0;
  let skipped = 0;
  let images = 0;

  for (const [index, post] of wpPosts.entries()) {
    const existing = await postRepo.findOneBy({ slug: post.slug });
    if (existing) {
      skipped++;
      continue;
    }

    const wpCategory = post.categories
      .map((id) => wpCategoryById.get(id))
      .find(Boolean);
    const categoryId = wpCategory ? (idBySlug.get(wpCategory.slug) ?? null) : null;

    let content = post.content?.rendered ?? '';
    let coverImagePath: string | null = null;

    if (!skipMedia && apply) {
      // Ảnh đại diện
      if (post.featured_media) {
        try {
          const media = await fetchJson<WpMedia>(
            `${site}/wp-json/wp/v2/media/${post.featured_media}`,
          );
          coverImagePath = await downloadImage(
            media.source_url,
            `${post.slug}-cover`,
          );
          if (coverImagePath) images++;
        } catch {
          /* ảnh lỗi thì bỏ qua, bài vẫn nhập */
        }
      }
      // Ảnh nằm trong nội dung bài
      const inline = [...content.matchAll(/<img[^>]+src="([^"]+)"/g)].map(
        (match) => match[1],
      );
      for (const [position, url] of [...new Set(inline)].entries()) {
        if (!url.startsWith(site)) continue;
        const local = await downloadImage(url, `${post.slug}-${position + 1}`);
        if (!local) continue;
        content = content.split(url).join(local);
        images++;
      }
    }

    console.log(
      `  + bài: ${stripTags(post.title.rendered).slice(0, 60)} [${wpCategory?.slug ?? 'không chuyên mục'}]`,
    );
    createdPosts++;
    if (!apply) continue;

    await postRepo.save(
      postRepo.create({
        title: decodeEntities(post.title.rendered),
        slug: post.slug,
        excerpt: stripTags(post.excerpt?.rendered ?? '').slice(0, 500) || null,
        content,
        categoryId,
        coverImagePath,
        status,
        publishedAt: post.date_gmt ? new Date(`${post.date_gmt}Z`) : new Date(),
        sortOrder: index + 1,
      }),
    );
  }

  console.log('\n--- Kết quả ---');
  console.log(`Chuyên mục tạo mới: ${createdCategories}`);
  console.log(`Bài tạo mới: ${createdPosts} | đã có sẵn, bỏ qua: ${skipped}`);
  console.log(`Ảnh tải về: ${images}${skipMedia ? ' (đang bật --skip-media)' : ''}`);
  if (!apply) {
    console.log('\nĐây mới là chạy thử. Thêm --apply để ghi vào database.');
  } else {
    console.log('\nXong. Vào Admin → Thư viện bấm "Quét lại" để ảnh hiện trong thư viện.');
  }

  await app.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

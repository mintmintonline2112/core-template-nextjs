import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { BlogPost } from '../modules/admin/blog-posts/entities/blog-post.entity';
import { Page } from '../modules/admin/pages/entities/page.entity';
import { slugify } from '../common/helpers/slug.helper';
import { ObjectLiteral, Repository } from 'typeorm';

/**
 * Sinh slug cho toàn bộ bản ghi cũ (đã seed trước khi có cột slug).
 * Dùng repo.update để chỉ ghi đúng cột `slug`.
 */
async function backfill<
  T extends ObjectLiteral & { id: number; title: string; slug?: string },
>(repo: Repository<T>, label: string): Promise<void> {
  const rows = await repo.find({ withDeleted: true } as any);
  const used = new Set<string>();

  // Nạp trước các slug đã có để không trùng.
  for (const r of rows) if (r.slug) used.add(r.slug);

  let count = 0;
  for (const r of rows) {
    if (r.slug) continue;

    const base = slugify(r.title) || label;
    let candidate = base;
    let i = 1;
    while (used.has(candidate)) {
      i += 1;
      candidate = `${base}-${i}`;
    }
    used.add(candidate);

    await repo.update(r.id, { slug: candidate } as any);
    count += 1;
  }

  console.log(`  ${label}: backfilled ${count}/${rows.length}`);
}

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  console.log('--- Backfill SEO slugs ---');
  await backfill(AppDataSource.getRepository(BlogPost), 'blog-post');
  await backfill(AppDataSource.getRepository(Page), 'page');
  console.log('--- Done ---');
  await AppDataSource.destroy();
}

bootstrap().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});

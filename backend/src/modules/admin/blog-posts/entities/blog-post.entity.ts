import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { SeoContentEntity } from 'src/common/base/seo-content.entity';
import { Staff } from '../../staffs/staffs.entity';
import { BlogCategory } from '../../blog-categories/entities/blog-category.entity';

@Entity('blog_posts')
@Index('IDX_blog_posts_publish', ['status', 'publishedAt'])
@Index('IDX_blog_posts_category_publish', [
  'categoryId',
  'status',
  'publishedAt',
])
export class BlogPost extends SeoContentEntity {
  @Column({ name: 'category_id', type: 'int', unsigned: true, nullable: true })
  categoryId: number | null;

  @ManyToOne(() => BlogCategory, (category) => category.posts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'FK_blog_posts_category',
  })
  category: BlogCategory | null;

  @Column({
    name: 'author_staff_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  authorStaffId: string | null;

  @ManyToOne(() => Staff, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'author_staff_id',
    foreignKeyConstraintName: 'FK_blog_posts_author',
  })
  author: Staff | null;

  @Column({ type: 'text', nullable: true })
  excerpt: string | null;

  @Column({ type: 'longtext' })
  content: string;

  @Column({
    name: 'cover_image_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  coverImagePath: string | null;

  /** File đã upload (uploads/videos/...) hoặc link YouTube/Vimeo. */
  @Column({ name: 'video_path', type: 'varchar', length: 500, nullable: true })
  videoPath: string | null;

  /** landscape (16:9) | portrait (9:16). */
  @Column({
    name: 'video_orientation',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  videoOrientation: 'landscape' | 'portrait' | null;

  @Column({
    name: 'published_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  publishedAt: Date | null;

  /** Bản dịch: { zh: { <field>: value } } — xem common/i18n/translations.ts */
  @Column({ type: 'json', nullable: true })
  translations: Record<string, Record<string, unknown>> | null;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;
}

import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';
import { BlogPost } from '../../blog-posts/entities/blog-post.entity';

@Entity('blog_categories')
@Index('IDX_blog_categories_parent', ['parentId'])
export class BlogCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** Tên hiện ngoài website (tùy chọn) — trống thì public dùng `name`. */
  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  displayName: string | null;

  @Index('UQ_blog_categories_slug', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ name: 'parent_id', type: 'int', unsigned: true, nullable: true })
  parentId: number | null;

  @ManyToOne(() => BlogCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'parent_id',
    foreignKeyConstraintName: 'FK_blog_categories_parent',
  })
  parent: BlogCategory | null;

  @OneToMany(() => BlogCategory, (category) => category.parent)
  children: BlogCategory[];

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index('IDX_blog_categories_active')
  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: boolean;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({
    name: 'meta_description',
    type: 'varchar',
    length: 320,
    nullable: true,
  })
  metaDescription: string | null;

  @Column({
    name: 'og_image_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  ogImagePath: string | null;

  @Column({
    name: 'canonical_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  canonicalUrl: string | null;

  /** Bản dịch: { zh: { <field>: value } } — xem common/i18n/translations.ts */
  @Column({ type: 'json', nullable: true })
  translations: Record<string, Record<string, unknown>> | null;

  @OneToMany(() => BlogPost, (post) => post.category)
  posts: BlogPost[];
}

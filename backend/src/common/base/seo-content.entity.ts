import { Column, Index } from 'typeorm';
import { PublishStatus } from '../enums/publish-status.enum';
import { BaseEntity } from './base.entity';

/**
 * Common columns copied into concrete CMS tables. This is TypeORM concrete-table
 * inheritance: no separate seo_content table is created.
 */
export abstract class SeoContentEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Index('UQ_seo_content_slug', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Index('IDX_seo_content_status')
  @Column({
    type: 'varchar',
    length: 32,
    default: PublishStatus.DRAFT,
  })
  status: PublishStatus;

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
}

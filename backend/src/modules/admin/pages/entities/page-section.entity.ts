import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';
import { Page } from './page.entity';

@Entity('page_sections')
@Index('UQ_page_sections_key', ['pageId', 'sectionKey'], { unique: true })
@Index('IDX_page_sections_listing', ['pageId', 'isActive', 'sortOrder'])
export class PageSection extends BaseEntity {
  @Column({ name: 'page_id', type: 'int', unsigned: true })
  pageId: number;

  @ManyToOne(() => Page, (page) => page.sections, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'page_id',
    foreignKeyConstraintName: 'FK_page_sections_page',
  })
  page: Page;

  @Column({ name: 'section_key', type: 'varchar', length: 120 })
  sectionKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  heading: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subheading: string | null;

  @Column({ type: 'longtext', nullable: true })
  content: string | null;

  @Column({ name: 'media_path', type: 'varchar', length: 500, nullable: true })
  mediaPath: string | null;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  /** Bản dịch: { zh: { <field>: value } } — xem common/i18n/translations.ts */
  @Column({ type: 'json', nullable: true })
  translations: Record<string, Record<string, unknown>> | null;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: boolean;
}

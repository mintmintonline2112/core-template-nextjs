import { Column, Entity, OneToMany } from 'typeorm';
import { SeoContentEntity } from 'src/common/base/seo-content.entity';
import { PageSection } from './page-section.entity';

@Entity('pages')
export class Page extends SeoContentEntity {
  @Column({ type: 'varchar', length: 160, nullable: true })
  eyebrow: string | null;

  @Column({ type: 'text', nullable: true })
  lead: string | null;

  /** Ảnh nền dải tiêu đề đầu trang (PageHero); trống = ảnh mặc định của website. */
  @Column({ name: 'hero_image_path', type: 'varchar', length: 500, nullable: true })
  heroImagePath: string | null;

  /** Điểm lấy nét của ảnh nền (CSS object-position, VD "50% 62%"). */
  @Column({ name: 'hero_image_position', type: 'varchar', length: 40, nullable: true })
  heroImagePosition: string | null;

  @Column({
    name: 'template_key',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  templateKey: string | null;

  /** Bản dịch: { zh: { <field>: value } } — xem common/i18n/translations.ts */
  @Column({ type: 'json', nullable: true })
  translations: Record<string, Record<string, unknown>> | null;

  @OneToMany(() => PageSection, (section) => section.page, {
    cascade: false,
  })
  sections: PageSection[];
}

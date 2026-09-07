import { Column, Entity, OneToMany } from 'typeorm';
import { SeoContentEntity } from 'src/common/base/seo-content.entity';
import { PageSection } from './page-section.entity';

@Entity('pages')
export class Page extends SeoContentEntity {
  @Column({ type: 'varchar', length: 160, nullable: true })
  eyebrow: string | null;

  @Column({ type: 'text', nullable: true })
  lead: string | null;

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

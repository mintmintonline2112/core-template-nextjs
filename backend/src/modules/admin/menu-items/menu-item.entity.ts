import { BaseEntity } from 'src/common/base/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

/**
 * Menu điều hướng của website public (dial menu). Hai cấp: item gốc (parentId
 * null) là spoke trên dial, item con là link trong submenu panel.
 */
@Entity('menu_items')
export class MenuItem extends BaseEntity {
  @Column({ type: 'varchar', length: 160 })
  label: string;

  @Column({ type: 'varchar', length: 500 })
  href: string;

  @Index('IDX_menu_items_parent')
  @Column({ name: 'parent_id', type: 'int', unsigned: true, nullable: true })
  parentId: number | null;

  @ManyToOne(() => MenuItem, (item) => item.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: MenuItem | null;

  @OneToMany(() => MenuItem, (item) => item.parent)
  children: MenuItem[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  /** Bản dịch: { zh: { <field>: value } } — xem common/i18n/translations.ts */
  @Column({ type: 'json', nullable: true })
  translations: Record<string, Record<string, unknown>> | null;

  @Column({ name: 'show_submenu', type: 'boolean', default: true })
  showSubmenu: boolean;
}

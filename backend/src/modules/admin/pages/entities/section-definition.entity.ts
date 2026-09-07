import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';

/**
 * Mô tả một field metadata mà giao diện website đọc từ section.
 * Admin dùng spec này để render khu chỉnh sửa trực quan (không cần JSON tay).
 */
export type SectionFieldSpec =
  | { key: string; label: string; type: 'stringList'; hint?: string }
  | {
      key: string;
      label: string;
      type: 'itemList';
      hint?: string;
      itemFields: Array<{
        name: string;
        label: string;
        kind: 'text' | 'textarea' | 'image';
      }>;
    }
  | {
      key: string;
      label: string;
      type: 'textMap';
      hint?: string;
      fields: Array<{ name: string; label: string }>;
    }
  | { key: string; label: string; type: 'json'; hint?: string };

/**
 * Danh mục "loại section" của website — nguồn chân lý cho admin biết trang nào
 * có những sectionKey nào và metadata của từng key có cấu trúc gì.
 * Bản ghi do hệ thống quản lý (seed đồng bộ theo code, admin chỉ đọc).
 */
@Entity('section_definitions')
export class SectionDefinition extends BaseEntity {
  @Column({ name: 'page_slug', type: 'varchar', length: 120 })
  pageSlug: string;

  @Index('UQ_section_definitions_key', { unique: true })
  @Column({ name: 'section_key', type: 'varchar', length: 120 })
  sectionKey: string;

  @Column({ type: 'varchar', length: 160 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Spec các field metadata (SectionFieldSpec[]). */
  @Column({ type: 'json' })
  fields: SectionFieldSpec[];
}

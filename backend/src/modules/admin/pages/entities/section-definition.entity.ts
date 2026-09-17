import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';

/** Phần chung của mọi field spec. */
type SpecBase = {
  key: string;
  label: string;
  hint?: string;
  /** Chỉ hiện (và chỉ validate) khi metadata.layout thuộc danh sách này. */
  layouts?: string[];
};

/**
 * Mô tả một field metadata mà giao diện website đọc từ section.
 * Admin dùng spec này để render khu chỉnh sửa trực quan (không cần JSON tay);
 * backend dùng để kiểm tra metadata trước khi lưu.
 */
export type SectionFieldSpec = SpecBase &
  (
    | { type: 'stringList' }
    | {
        type: 'itemList';
        itemFields: Array<{
          name: string;
          label: string;
          kind: 'text' | 'textarea' | 'image';
        }>;
      }
    | {
        type: 'textMap';
        fields: Array<{ name: string; label: string }>;
      }
    | {
        type: 'image';
        /** Key metadata lưu vị trí ảnh (CSS object-position, VD "50% 62%") — admin hiện công cụ chọn điểm lấy nét. */
        positionKey?: string;
      }
    | { type: 'json' }
    | {
        /** Chọn một giá trị (VD layout) — hiện dạng nút bấm. */
        type: 'select';
        options: Array<{ value: string; label: string; hint?: string }>;
      }
  );

/**
 * Danh mục "component" của website — nguồn chân lý cho admin biết có những
 * component nào, mỗi component có những layout / field metadata gì.
 * Bản ghi do hệ thống quản lý (seed đồng bộ theo code, admin chỉ đọc).
 */
@Entity('section_definitions')
export class SectionDefinition extends BaseEntity {
  /** Nhóm hiển thị trong admin (hiện tại mọi component đều là `shared` — dùng được ở mọi trang). */
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

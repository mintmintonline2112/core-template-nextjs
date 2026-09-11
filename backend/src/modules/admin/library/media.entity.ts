import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type MediaKind = 'image' | 'video';

/**
 * Chỉ mục file trong thư mục uploads/.
 *
 * Ổ ĐĨA vẫn là nguồn sự thật về việc file có tồn tại hay không; bảng này thêm
 * hai thứ mà hệ thống cũ (quét thư mục mỗi request) không làm được:
 *   1. truy vấn nhanh — phân trang/tìm kiếm bằng SQL thay vì đọc cả cây thư mục
 *   2. lưu thông tin kèm ảnh — alt text, kích thước, ai tải lên
 *
 * Lệch giữa ổ đĩa và bảng (ai đó copy file bằng FTP, hoặc xoá tay) được hàm
 * sync() trong LibraryService xử lý: chạy lúc khởi động và khi bấm "Quét lại".
 */
@Entity('media')
@Index('IDX_media_kind_created', ['kind', 'createdAt'])
@Index('IDX_media_folder', ['folder'])
export class Media {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  /** Đường dẫn tương đối tính từ gốc dự án, vd. `uploads/library/logo.png`. */
  @Index('UQ_media_path', { unique: true })
  @Column({ type: 'varchar', length: 500 })
  path: string;

  /** Tên file kèm đuôi. */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** Thư mục con trong uploads/ (`library`, `blog-posts`, `videos`…); gốc = `root`. */
  @Column({ type: 'varchar', length: 190, default: 'root' })
  folder: string;

  @Column({ type: 'varchar', length: 10 })
  kind: MediaKind;

  /** Đuôi file, không có dấu chấm. */
  @Column({ type: 'varchar', length: 16 })
  extension: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 120, nullable: true })
  mimeType: string | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  size: number;

  /** Kích thước ảnh (video để trống). */
  @Column({ type: 'int', unsigned: true, nullable: true })
  width: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  height: number | null;

  /** Mô tả ảnh cho SEO và trình đọc màn hình. */
  @Column({ type: 'varchar', length: 300, nullable: true })
  alt: string | null;

  /** staffs.id của người tải lên (null với file quét từ ổ đĩa). */
  @Column({
    name: 'uploaded_by_staff_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  uploadedByStaffId: string | null;

  /** mtime của file trên ổ — dùng để sắp xếp "mới nhất" và phát hiện file bị thay. */
  @Column({ name: 'modified_at', type: 'datetime', precision: 6 })
  modifiedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;
}

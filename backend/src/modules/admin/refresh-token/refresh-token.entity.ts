import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Staff } from '../staffs/staffs.entity';

/**
 * Một hàng = một phiên đăng nhập còn sống. Đăng xuất hoặc hết hạn thì hàng bị xoá,
 * nên bảng này không phình theo lịch sử đăng nhập.
 */
@Entity('staff_refresh_tokens')
@Index('IDX_staff_refresh_expires', ['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('increment')
  id: number;

  /**
   * Mã phiên ngẫu nhiên, nhúng sẵn trong refresh token. Nhờ nó mà tra được đúng
   * một hàng bằng chỉ mục thay vì quét cả bảng.
   */
  @Index('UQ_staff_refresh_session', { unique: true })
  @Column({ name: 'session_id', type: 'varchar', length: 64 })
  sessionId: string;

  // 🔗 RELATION
  @ManyToOne(() => Staff, (staff) => staff.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  /**
   * SHA-256 của refresh token. Không dùng bcrypt: bcrypt chỉ băm 72 byte đầu, mà
   * 72 byte đầu của mọi refresh token cùng một nhân viên là như nhau. Token vốn
   * đã dài và ngẫu nhiên nên không cần hàm băm chậm chống dò như mật khẩu.
   */
  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  device: string;

  @Column({ nullable: true })
  browser: string; // Chrome, Firefox...

  @Column({ nullable: true })
  os: string; // Windows, MacOS...
}

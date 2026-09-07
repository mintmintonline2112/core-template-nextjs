import { Exclude } from 'class-transformer';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import { UserRefreshToken } from '../refresh-token/user_refresh-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 1 })
  sort: number;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ name: 'avatar', nullable: true, length: 255 })
  avatar: string;

  @AfterLoad()
  updateImageUrl() {
    const baseUrl = 'http://localhost:3000';
    if (!this.avatar) {
      this.avatar = `${baseUrl}/assets/images/noimage.png`;
      return;
    }
    if (!this.avatar.startsWith('http')) {
      this.avatar = `${baseUrl}/${this.avatar}`;
    }
  }

  @Index({ unique: true })
  @Column({ name: 'email', length: 255 })
  email: string;

  @Exclude()
  @Column({ name: 'password', length: 255 })
  password: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.INACTIVE,
  })
  status: AccountStatus;

  @Column({ name: 'phone', nullable: true, length: 20 })
  phone: string;

  @Column({ name: 'address', nullable: true, type: 'text' })
  address: string;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @OneToMany(() => UserRefreshToken, (token) => token.user)
  refreshTokens: UserRefreshToken[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Column({ name: 'otp', nullable: true, length: 64 })
  @Exclude()
  otp: string;

  @Column({ name: 'otp_expires', type: 'timestamp', nullable: true })
  otpExpires: Date;
}

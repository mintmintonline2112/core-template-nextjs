import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from '../refresh-token/refresh-token.entity';
import { Role } from '../roles/roles.entity';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { Exclude } from 'class-transformer';
import { AccountType } from 'src/common/enums/account-type.enum';

@Entity('staffs')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'staff_code', type: 'varchar', length: 20 })
  staffCode: string;

  @Column({ name: 'sort', type: 'int', default: 1 })
  sort: number;

  @Column({
    name: 'type',
    type: 'enum',
    enum: AccountType,
    default: AccountType.STAFF,
  })
  type: AccountType;

  @Column({ name: 'email', unique: true, length: 255 })
  email: string;

  @Exclude()
  @Column({ name: 'password', length: 255 })
  password: string;

  @Column({ name: 'name', nullable: true, length: 255 })
  name: string;

  @Column({ name: 'avatar', nullable: true, length: 255 })
  avatar: string;

  @Column({ name: 'phone', nullable: true })
  phone: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @Column({ default: false })
  is_online: boolean;

  @Column({ name: 'role_id', type: 'int', unsigned: true })
  role_id: number;

  @ManyToOne(() => Role, (role) => role.staffs)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Exclude()
  @OneToMany(() => RefreshToken, (rt) => rt.staff)
  refreshTokens: RefreshToken[];

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}

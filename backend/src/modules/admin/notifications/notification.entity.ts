import { BaseEntity } from 'src/common/base/base.entity';
import { Entity, Column, Index } from 'typeorm';

@Entity('notifications')
export class AppNotification extends BaseEntity {
  @Column()
  @Index()
  type: string;

  @Column()
  @Index()
  module: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;
}

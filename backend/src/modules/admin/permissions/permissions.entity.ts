import { Column, Entity, Index, ManyToMany } from 'typeorm';
import { Role } from '../roles/roles.entity';
import { BaseEntity } from 'src/common/base/base.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  code: string;

  @Index()
  @Column()
  module: string;

  @Column({ nullable: true })
  description: string;

  // 🔗 RELATION

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}

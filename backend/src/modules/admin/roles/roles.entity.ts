import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Permission } from '../permissions/permissions.entity';
import { Staff } from '../staffs/staffs.entity';
import { BaseEntity } from 'src/common/base/base.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Staff, (staff) => staff.role)
  staffs: Staff[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: Permission[];
}

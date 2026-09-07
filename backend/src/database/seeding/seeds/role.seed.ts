import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/modules/admin/permissions/permissions.entity';
import { Role } from 'src/modules/admin/roles/roles.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleSeed {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async run(): Promise<void> {
    const allPermissions = await this.permissionRepo.find();
    const staffPermissions = allPermissions.filter(
      (permission) =>
        permission.code.endsWith('_LIST') ||
        permission.code.endsWith('_DETAIL'),
    );

    const existing = await this.roleRepo.find({
      relations: { permissions: true },
    });
    const adminRole =
      existing.find((role) => role.name === 'Admin') ??
      this.roleRepo.create({
        name: 'Admin',
        description: 'Full access to all system functions',
      });
    adminRole.permissions = allPermissions;

    const staffRole =
      existing.find((role) => role.name === 'Staff') ??
      this.roleRepo.create({
        name: 'Staff',
        description: 'Read-only access for daily content operations',
      });
    staffRole.permissions = staffPermissions;

    await this.roleRepo.save([adminRole, staffRole]);
  }
}

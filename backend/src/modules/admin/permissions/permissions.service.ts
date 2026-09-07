import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './permissions.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsService extends BaseService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super(permissionRepository);
  }

  async findAllGrouped() {
    const permissions = await this.permissionRepository.find();

    const grouped = permissions.reduce(
      (acc, permission) => {
        const moduleName = permission.module;
        if (!acc[moduleName]) {
          acc[moduleName] = [];
        }
        acc[moduleName].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );

    return grouped;
  }
}

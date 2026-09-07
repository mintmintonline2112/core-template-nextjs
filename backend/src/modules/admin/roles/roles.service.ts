import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base/base.service';
import { Repository } from 'typeorm';
import { Role } from './roles.entity';
import { Permission } from '../permissions/permissions.entity';
import { CreateRoleDto } from './dto/CreateRoleDto';
import { UpdateRoleDto } from './dto/UpdateRoleDto';

@Injectable()
export class RolesService extends BaseService<Role, number> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super(roleRepository);
  }

  private async checkAdminProtection(
    id: number,
    action: string,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);

    if (role.name.toUpperCase() === 'ADMIN') {
      throw new InternalServerErrorException(
        `Not allowed to ${action} the system administrator role (Admin).`,
      );
    }

    return role;
  }

  override async create(data: any): Promise<Role> {
    const dto = data as CreateRoleDto;
    const { permissions, ...roleData } = dto;
    const mappedPermissions = permissions?.map((id) => ({ id }));

    const entity = this.roleRepository.create({
      ...roleData,
      permissions: mappedPermissions as any,
    });

    return await this.roleRepository.save(entity);
  }

  override async update(id: number, data: any): Promise<Role> {
    await this.checkAdminProtection(id, 'modify');

    const dto = data as UpdateRoleDto;
    const { permissions, ...roleData } = dto;

    const roleWithRelations = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (permissions) {
      roleWithRelations.permissions = permissions.map((id) => ({ id })) as any;
    }
    Object.assign(roleWithRelations, roleData);

    return await this.roleRepository.save(roleWithRelations);
  }

  override async delete(id: number): Promise<any> {
    await this.checkAdminProtection(id, 'delete');
    return await super.delete(id);
  }
}

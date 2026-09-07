import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base/base.service';
import { Staff } from './staffs.entity';
import { Not, Repository } from 'typeorm';
import { CreateStaffDto } from './dto/CreateStaffDto';
import { UpdateStaffDto } from './dto/UpdateStaffDto';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { AccountType } from 'src/common/enums/account-type.enum';
import { User } from '../users/user.entity';
import { isAdmin } from 'src/common/helpers/isAdmin.helper';

@Injectable()
export class StaffsService extends BaseService<Staff, string> {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(staffRepository);
  }

  private async checkAdminProtection(
    id: string,
    action: string,
  ): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id } as any });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (staff.type === AccountType.ADMIN) {
      throw new BadRequestException(
        `Cannot ${action} system administrator account`,
      );
    }

    return staff;
  }

  async createStaff(data: CreateStaffDto): Promise<Staff> {
    const [existingStaff, existingUser] = await Promise.all([
      this.staffRepository.findOne({ where: { email: data.email } }),
      this.userRepository.findOne({ where: { email: data.email } }),
    ]);

    if (existingStaff || existingUser) {
      throw new BadRequestException('Email is empty');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const staff = this.staffRepository.create({
      ...data,
      password: hashedPassword,
    });

    return await this.staffRepository.save(staff);
  }

  async updateStaff(
    id: string,
    data: UpdateStaffDto,
    actorId?: string,
  ): Promise<Staff> {
    const staff = await this.checkAdminProtection(id, 'update');

    if (data.email) {
      const [existingStaff, existingUser] = await Promise.all([
        this.staffRepository.findOne({
          where: { email: data.email, id: Not(id) },
        }),
        this.userRepository.findOne({ where: { email: data.email } }),
      ]);

      if (existingStaff || existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updateData: any = { ...data };

    const nextRoleId = data.role_id ?? data.roleId;
    if (nextRoleId !== undefined) {
      updateData.role_id = nextRoleId;
      delete updateData.roleId;
    }

    if (data.password) {
      if (!data.confirmPassword) {
        throw new BadRequestException('Confirm password is required');
      }

      if (data.password !== data.confirmPassword) {
        throw new BadRequestException('Password confirmation does not match');
      }

      let isAdminUser = false;

      if (actorId) {
        isAdminUser = await isAdmin(this.staffRepository, actorId);
      }

      if (!isAdminUser) {
        if (!data.currentPassword) {
          throw new BadRequestException('Current password is required');
        }

        const isMatch = await bcrypt.compare(
          data.currentPassword,
          staff.password,
        );

        if (!isMatch) {
          throw new BadRequestException('Current password is incorrect');
        }
      }

      updateData.password = await bcrypt.hash(data.password, 10);
    }

    delete updateData.currentPassword;
    delete updateData.confirmPassword;

    const entity = await this.staffRepository.preload({
      id,
      ...updateData,
    });

    if (!entity) {
      throw new NotFoundException(`Staff with id ${id} not found`);
    }

    return await this.staffRepository.save(entity);
  }

  async toggleStatus(id: string, actorId?: string): Promise<Staff> {
    if (actorId && actorId === id) {
      throw new BadRequestException(
        'You cannot block/unblock your own account',
      );
    }

    const staff = await this.checkAdminProtection(id, 'change status');

    staff.status =
      staff.status === AccountStatus.ACTIVE
        ? AccountStatus.BLOCKED
        : AccountStatus.ACTIVE;

    return await this.staffRepository.save(staff);
  }

  override async delete(id: string, actorId?: string) {
    if (actorId && actorId === id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    await this.checkAdminProtection(id, 'delete');
    return await super.delete(id);
  }
}

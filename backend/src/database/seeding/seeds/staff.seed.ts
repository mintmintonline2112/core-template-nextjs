import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { AccountType } from 'src/common/enums/account-type.enum';

import { Role } from 'src/modules/admin/roles/roles.entity';
import { Staff } from 'src/modules/admin/staffs/staffs.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StaffSeed {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async run(): Promise<void> {
    const count = await this.staffRepo.count();
    if (count > 0) return;

    const [adminRole, staffRole] = await Promise.all([
      this.roleRepo.findOne({ where: { name: 'Admin' } }),
      this.roleRepo.findOne({ where: { name: 'Staff' } }),
    ]);

    if (!adminRole) {
      throw new Error('Missing role: Admin');
    }

    const saltRounds = 10;

    // Tài khoản mặc định môi trường dev — ĐỔI MẬT KHẨU trước khi lên production.
    const rawStaffs: Array<Partial<Staff>> = [
      {
        staffCode: 'ADM001',
        name: 'Prime Nuts Admin',
        email: 'admin@gmail.com',
        password: 'admin#123',
        role: adminRole,
        type: AccountType.ADMIN,
        status: AccountStatus.ACTIVE,
      },
      {
        staffCode: 'STF001',
        name: 'Sales Staff',
        email: 'staff1@gmail.com',
        password: 'staff#123',
        role: staffRole ?? adminRole,
        type: AccountType.STAFF,
        status: AccountStatus.ACTIVE,
      },
    ];

    const staffData: Partial<Staff>[] = await Promise.all(
      rawStaffs.map(async (s) => ({
        ...s,
        password: await bcrypt.hash(s.password, saltRounds),
      })),
    );

    const newStaffs = this.staffRepo.create(staffData);
    await this.staffRepo.save(newStaffs);

    console.log(
      `--- [Seed] Created ${newStaffs.length} staffs with staffCodes.`,
    );
  }
}

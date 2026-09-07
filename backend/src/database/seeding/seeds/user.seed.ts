import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { User } from 'src/modules/admin/users/user.entity';

@Injectable()
export class UserSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async run(): Promise<void> {
    const count = await this.userRepo.count();
    if (count > 0) {
      console.log('--- UserSeed: Data already exists, skipping. ---');
      return;
    }

    console.log('--- UserSeed: Seeding users... ---');

    const saltRounds = 10;

    // Tạo hash cho mật khẩu cố định
    const rootPassword = await bcrypt.hash('user#123', saltRounds);
    const defaultPassword = await bcrypt.hash('password123', saltRounds);

    const usersData: Partial<User>[] = [];

    usersData.push({
      sort: 0,
      fullName: 'Root User',
      email: 'user@gmail.com',
      password: rootPassword,
      avatar: faker.image.avatar(),
      phone: '0901234567',
      address: 'Hanoi, Vietnam',
      status: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
      createdAt: new Date(),
    });

    for (let i = 0; i < 19; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      usersData.push({
        sort: 1,
        fullName: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: defaultPassword,
        avatar: faker.image.avatar(),
        phone: faker.helpers.fromRegExp(/0[35789][0-9]{8}/),
        address: faker.location.streetAddress({ useFullAddress: true }),
        status: faker.helpers.arrayElement([
          AccountStatus.ACTIVE,
          AccountStatus.ACTIVE,
          AccountStatus.ACTIVE,
          AccountStatus.PENDING,
          AccountStatus.BLOCKED,
        ]),
        emailVerifiedAt: faker.date.past(),
        lastLoginAt: faker.date.recent(),
        createdAt: faker.date.past({ years: 1 }),
      });
    }

    await this.userRepo.save(this.userRepo.create(usersData));

    console.log('--- UserSeed: Successfully seeded users (Root + Random)! ---');
  }
}

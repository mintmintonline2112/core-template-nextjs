import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base/base.service';
import { DataSource, Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { CreateUserDto } from './dto/CreateUserDto';
import * as bcrypt from 'bcrypt';
import { Staff } from '../staffs/staffs.entity';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { isAdmin } from 'src/common/helpers/isAdmin.helper';
import { UserRefreshToken } from '../refresh-token/user_refresh-token.entity';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,

    @InjectRepository(UserRefreshToken)
    private userRefreshTokenRepository: Repository<UserRefreshToken>,

    private readonly dataSource: DataSource,
  ) {
    super(userRepository);
  }

  async toggleStatus(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } as any });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    user.status =
      user.status === AccountStatus.ACTIVE
        ? AccountStatus.BLOCKED
        : AccountStatus.ACTIVE;

    return await this.userRepository.save(user);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const [existingStaff, existingUser] = await Promise.all([
      this.staffRepository.findOne({ where: { email: data.email } }),
      this.userRepository.findOne({ where: { email: data.email } }),
    ]);

    if (existingStaff || existingUser) {
      throw new BadRequestException('Email already exists');
    }

    if (!data.confirmPassword) {
      throw new BadRequestException('Confirm password is required');
    }

    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }
  async updateUser(
    id: string,
    data: UpdateUserDto,
    actorId?: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.email) {
      const [existingStaff, existingUser] = await Promise.all([
        this.staffRepository.findOne({
          where: { email: data.email, id: Not(id) },
        }),
        this.userRepository.findOne({
          where: { email: data.email, id: Not(id) },
        }),
      ]);

      if (existingStaff || existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updateData: any = { ...data };

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
          user.password,
        );

        if (!isMatch) {
          throw new BadRequestException('Current password is incorrect');
        }
      }

      updateData.password = await bcrypt.hash(data.password, 10);
    }

    delete updateData.currentPassword;
    delete updateData.confirmPassword;

    return await super.update(id, updateData);
  }

async getDashboardStats() {
  const [userSummary, recentUsers, pendingCounts, browserStats, userGrowth, activeSessions, topOrderers] = await Promise.all([
    this.dataSource.query<any[]>(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'active'   THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'blocked'  THEN 1 ELSE 0 END) AS blocked,
        SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS newThisMonth,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)  THEN 1 ELSE 0 END) AS newThisWeek
      FROM users
      WHERE deleted_at IS NULL
    `),
    this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: 6,
      select: ['id', 'fullName', 'email', 'avatar', 'status', 'createdAt'],
    }),
    this.dataSource.query<any[]>(`
      SELECT
        (SELECT COUNT(*) FROM \`orders\`        WHERE status = 'PENDING')    AS pendingOrders,
        (SELECT COUNT(*) FROM order_refunds     WHERE status = 'PENDING')    AS pendingOrderRefunds,
        (SELECT COUNT(*) FROM payment_refunds   WHERE status = 'PENDING')    AS pendingPaymentRefunds,
        (SELECT COUNT(*) FROM deliveries        WHERE status IN ('ASSIGNED','PICKED','SHIPPING')) AS activeDeliveries
    `),
    this.dataSource.query<any[]>(`
      SELECT browser AS label, COUNT(*) AS count
      FROM user_refresh_tokens
      WHERE browser IS NOT NULL AND browser != ''
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 6
    `),
    this.dataSource.query<any[]>(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        AND deleted_at IS NULL
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `),
    this.dataSource.query<any[]>(`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM user_refresh_tokens
      WHERE is_revoked = false AND expires_at > NOW()
    `),
    this.dataSource.query<any[]>(`
      SELECT u.id, u.full_name AS fullName, u.email, u.avatar,
        COUNT(o.id) AS orderCount,
        COALESCE(SUM(CAST(o.total_amount AS DECIMAL(12,2))), 0) AS totalSpent
      FROM users u
      INNER JOIN \`orders\` o ON o.user_id = u.id
      WHERE u.deleted_at IS NULL
      GROUP BY u.id, u.full_name, u.email, u.avatar
      ORDER BY orderCount DESC
      LIMIT 5
    `),
  ]);

  const u = userSummary[0];
  const p = pendingCounts[0];

  return {
    users: {
      total:        Number(u.total),
      active:       Number(u.active),
      blocked:      Number(u.blocked),
      pending:      Number(u.pending),
      newThisMonth: Number(u.newThisMonth),
      newThisWeek:  Number(u.newThisWeek),
    },
    pending: {
      orders:           Number(p.pendingOrders),
      orderRefunds:     Number(p.pendingOrderRefunds),
      paymentRefunds:   Number(p.pendingPaymentRefunds),
      activeDeliveries: Number(p.activeDeliveries),
    },
    recentUsers,
    browserStats: browserStats.map((b) => ({
      label: b.label,
      count: Number(b.count),
    })),
    userGrowth: userGrowth.map((r) => ({
      month: r.month as string,
      count: Number(r.count),
    })),
    activeNow: Number(activeSessions[0]?.count ?? 0),
    topOrderers: topOrderers.map((r) => ({
      id: r.id as string,
      fullName: r.fullName as string,
      email: r.email as string,
      avatar: r.avatar as string | null,
      orderCount: Number(r.orderCount),
      totalSpent: Number(r.totalSpent),
    })),
  };
}

async getTrafficStats() {
  try {
    const stats = await this.userRefreshTokenRepository
      .createQueryBuilder('token')
      .select('token.browser', 'source')
      .addSelect('token.device', 'device')
      .addSelect('token.os', 'os')
      .addSelect('MAX(token.ip_address)', 'ip') 
      .addSelect('MAX(token.user_agent)', 'userAgent') 
      .addSelect('COUNT(*)', 'count')
   
      .addSelect(
        'ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2)', 
        'percentage'
      )
      .groupBy('token.browser')
      .addGroupBy('token.device')
      .addGroupBy('token.os')
      
      .orderBy('count', 'DESC')
      .getRawMany();

    return stats;
  } catch (error) {
    console.error('Lỗi truy vấn traffic chi tiết:', error);
    return [];
  }
}
}

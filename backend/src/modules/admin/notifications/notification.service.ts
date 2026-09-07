import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from 'src/common/base/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository } from 'typeorm';
import { AppNotification } from './notification.entity';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class NotificationService extends BaseService<AppNotification, number> {
  constructor(
    @InjectRepository(AppNotification)
    private readonly appNotificationRepository: Repository<AppNotification>,

    @Inject(REQUEST) private readonly request: any,
  ) {
    super(appNotificationRepository);
  }

  async markAsRead(ids: number[]): Promise<void> {
    await this.appNotificationRepository.update(
      { id: In(ids) },
      { is_read: true },
    );
  }

  async paginate(
    options: FindManyOptions<AppNotification> = {},
    page = 1,
    limit = 10,
    search?: string,
    searchFields: (keyof AppNotification)[] = [],
    filters: Record<string, any> = {},
    orderBy?: Partial<Record<keyof AppNotification, 'ASC' | 'DESC'>>[],
  ) {
    const user = this.request.user;
    const userModules = user?.modules || [];

    if (userModules.length > 0) {
      filters.module = In(userModules);
    } else {
      filters.module = '__NO_PERMISSION__';
    }

    return super.paginate(
      options,
      page,
      limit,
      search,
      searchFields,
      filters,
      orderBy,
    );
  }
}

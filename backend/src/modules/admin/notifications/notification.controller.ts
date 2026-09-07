import { BaseController } from 'src/common/base/base.controller';
import { NotificationService } from './notification.service';
import { AppNotification } from './notification.entity';
import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { UpdateNotificationDto } from './dto/UpdateNotificationDto';
import { CreateNotificationDto } from './dto/CreateNotificationDto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';

@ApiTags('Notifications')
@UseGuards(JwtAdminAuthGuard)
@Controller('admin/notifications')
export class NotificationController extends BaseController<
  AppNotification,
  CreateNotificationDto,
  UpdateNotificationDto,
  number
> {
  constructor(private readonly appNotificationService: NotificationService) {
    super(appNotificationService, 'Notifications');
  }

  @Patch('mark-as-read')
  async markAsRead(@Body('ids') ids: number[]) {
    return await this.appNotificationService.markAsRead(ids);
  }
}

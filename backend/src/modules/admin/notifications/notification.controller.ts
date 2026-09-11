import { BaseController } from 'src/common/base/base.controller';
import { NotificationService } from './notification.service';
import { AppNotification } from './notification.entity';
import {
  Body,
  Controller,
  Param,
  Patch,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { UpdateNotificationDto } from './dto/UpdateNotificationDto';
import { CreateNotificationDto } from './dto/CreateNotificationDto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guard/admin/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';

@ApiTags('Notifications')
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'NOTIFICATION')
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

  // Cố ý dùng LIST chứ không phải UPDATE: đánh dấu đã đọc là thao tác của chính
  // người xem chuông thông báo, ai xem được danh sách thì tắt được chấm đỏ.
  @Permissions('LIST')
  @Patch('mark-as-read')
  async markAsRead(@Body('ids') ids: number[]) {
    return await this.appNotificationService.markAsRead(ids);
  }
}

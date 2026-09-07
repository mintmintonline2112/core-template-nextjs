import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactEntity } from './entities/contact.entity';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { MailModule } from '../mail/mail.module';
import { AdminContactController } from './admin-contact.controller';
import { AppNotification } from '../notifications/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactEntity, AppNotification]),
    MailModule,
  ],
  controllers: [ContactController, AdminContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}

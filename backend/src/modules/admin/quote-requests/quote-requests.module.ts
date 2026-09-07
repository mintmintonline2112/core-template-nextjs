import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { AppNotification } from '../notifications/notification.entity';
import { AdminQuoteRequestsController } from './admin-quote-requests.controller';
import { QuoteRequest } from './entities/quote-request.entity';
import { QuoteRequestsController } from './quote-requests.controller';
import { QuoteRequestsService } from './quote-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuoteRequest, AppNotification]),
    MailModule,
  ],
  controllers: [QuoteRequestsController, AdminQuoteRequestsController],
  providers: [QuoteRequestsService],
  exports: [QuoteRequestsService],
})
export class QuoteRequestsModule {}

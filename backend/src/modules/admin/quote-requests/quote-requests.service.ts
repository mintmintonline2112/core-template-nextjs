import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { MailService } from '../mail/mail.service';
import { quoteRequestTemplate } from '../mail/templates/quote-request.template';
import { AppNotification } from '../notifications/notification.entity';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';
import {
  QuoteRequest,
  QuoteRequestStatus,
} from './entities/quote-request.entity';
import { NOTIFICATION_MODULE } from 'src/common/constants/notification-modules';

@Injectable()
export class QuoteRequestsService extends BaseService<QuoteRequest, number> {
  constructor(
    @InjectRepository(QuoteRequest)
    private readonly quoteRepo: Repository<QuoteRequest>,
    @InjectRepository(AppNotification)
    private readonly notificationRepo: Repository<AppNotification>,
    private readonly mailService: MailService,
  ) {
    super(quoteRepo);
  }

  async submit(data: CreateQuoteRequestDto): Promise<{ id: number }> {
    const quote = await this.create({
      company: data.company,
      contactName: data.contactName ?? null,
      email: data.email,
      phone: data.phone ?? null,
      country: data.country ?? null,
      variety: data.variety,
      sizeGrade: data.sizeGrade ?? null,
      volume: data.volume,
      packaging: data.packaging ?? null,
      destination: data.destination,
      incoterm: data.incoterm ?? null,
      message: data.message ?? null,
      status: QuoteRequestStatus.NEW,
    });

    try {
      await this.notificationRepo.save(
        this.notificationRepo.create({
          type: 'quote-request',
          module: NOTIFICATION_MODULE.quoteRequest,
          title: `New quote request from ${data.company}`,
          message: `${data.variety} — ${data.volume} → ${data.destination}`,
          metadata: { link: '/admin/quote-requests', quoteRequestId: quote.id },
        }),
      );
    } catch {
      console.warn('Quote request saved, but the admin notification failed');
    }

    if (process.env.MAIL_FROM) {
      try {
        await this.mailService.sendMail({
          to: process.env.MAIL_FROM,
          subject: `[Quote] ${data.company} — ${data.variety} → ${data.destination}`,
          replyTo: data.email,
          html: quoteRequestTemplate(data),
        });
      } catch {
        console.warn('Quote request saved, but the notification email failed');
      }
    }

    return { id: quote.id };
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    status?: QuoteRequestStatus,
  ) {
    return this.paginate(
      {},
      page,
      limit,
      search,
      ['company', 'email', 'destination', 'variety'],
      status ? { status } : {},
    );
  }

  async findById(id: number): Promise<QuoteRequest> {
    const quote = await this.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException(`Quote request ${id} not found`);
    }
    return quote;
  }

  async updateStatus(
    id: number,
    status: QuoteRequestStatus,
  ): Promise<QuoteRequest> {
    return this.update(id, { status });
  }

  async exportAll(): Promise<Buffer> {
    const rows = await this.find({ order: { createdAt: 'DESC' } });
    return this.exportToExcel(
      rows,
      {
        id: 'ID',
        createdAt: 'Received At',
        company: true,
        contactName: 'Contact',
        email: true,
        phone: true,
        country: true,
        variety: true,
        sizeGrade: 'Size & Grade',
        volume: true,
        packaging: true,
        destination: true,
        incoterm: 'Incoterm',
        status: true,
        message: true,
      },
      'Quote Requests',
    );
  }
}

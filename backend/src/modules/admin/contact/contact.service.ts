import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { contactTemplate } from '../mail/templates/contact.template';
import { AppNotification } from '../notifications/notification.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactEntity } from './entities/contact.entity';
import { NOTIFICATION_MODULE } from 'src/common/constants/notification-modules';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactRepo: Repository<ContactEntity>,
    @InjectRepository(AppNotification)
    private readonly notificationRepo: Repository<AppNotification>,
    private readonly mailService: MailService,
  ) {}

  async create(data: CreateContactDto) {
    if (!data) {
      throw new BadRequestException('Contact data is required');
    }

    const contact = this.contactRepo.create({
      fullname: data.fullname,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    });

    await this.contactRepo.save(contact);

    try {
      await this.notificationRepo.save(
        this.notificationRepo.create({
          type: 'contact',
          module: NOTIFICATION_MODULE.contact,
          title: `Liên hệ mới từ ${data.fullname}`,
          message: data.subject || data.message.slice(0, 120),
          metadata: { link: '/admin/contacts', contactId: contact.id },
        }),
      );
    } catch {
      console.warn('Contact was saved, but the admin notification failed');
    }

    try {
      await this.mailService.sendMail({
        to: process.env.MAIL_FROM,
        subject: 'New Contact',
        replyTo: data.email,
        html: contactTemplate(data),
      });
    } catch {
      console.warn('Contact was saved, but notification email could not be sent');
    }

    return { message: 'Gửi liên hệ thành công' };
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const currentPage = Number(page);
    const pageSize = Number(limit);

    if (!Number.isInteger(currentPage) || currentPage < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }

    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const query = this.contactRepo
      .createQueryBuilder('contact')
      .orderBy('contact.createdAt', 'DESC')
      .skip((currentPage - 1) * pageSize)
      .take(pageSize);

    const keyword = search?.trim();
    if (keyword) {
      query.andWhere(
        new Brackets((builder) => {
          builder
            .where('contact.fullname LIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('contact.email LIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('contact.phone LIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere('contact.subject LIKE :keyword', {
              keyword: `%${keyword}%`,
            });
        }),
      );
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: number) {
    const contact = await this.contactRepo.findOneBy({ id });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async remove(id: number) {
    const contact = await this.findOne(id);
    await this.contactRepo.remove(contact);
    return { id, deleted: true };
  }
}

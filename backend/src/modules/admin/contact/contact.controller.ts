import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateContactDto } from './dto/create-contact.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Client Contact')
@Controller('client/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Gửi liên hệ' })
  @ApiBody({ type: CreateContactDto })
  create(@Body() body: CreateContactDto) {
    return this.contactService.create(body);
  }
}

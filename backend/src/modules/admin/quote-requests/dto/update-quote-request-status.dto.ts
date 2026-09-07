import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { QuoteRequestStatus } from '../entities/quote-request.entity';

export class UpdateQuoteRequestStatusDto {
  @ApiProperty({
    enum: QuoteRequestStatus,
    example: QuoteRequestStatus.PROCESSING,
  })
  @IsEnum(QuoteRequestStatus)
  status: QuoteRequestStatus;
}

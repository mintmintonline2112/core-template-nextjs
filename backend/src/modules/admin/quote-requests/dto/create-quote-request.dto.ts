import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateQuoteRequestDto {
  @ApiProperty({ example: 'Saigon Nut Trading Co.' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  company: string;

  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactName?: string;

  @ApiProperty({ example: 'buyer@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+84 901 234 567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: 'Vietnam' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @ApiProperty({ example: 'Nonpareil' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  variety: string;

  @ApiPropertyOptional({ example: '23/25' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sizeGrade?: string;

  @ApiProperty({ example: '1 × 40′ FCL / 20 MT' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  volume: string;

  @ApiPropertyOptional({ example: '50 lb cartons' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  packaging?: string;

  @ApiProperty({ example: 'Vietnam — Cat Lai Port' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  destination: string;

  @ApiPropertyOptional({ example: 'CIF' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  incoterm?: string;

  @ApiPropertyOptional({
    example: 'Certifications, target shipment window, other specifications…',
  })
  @IsOptional()
  @IsString()
  message?: string;
}

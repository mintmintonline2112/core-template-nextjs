import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsTranslations } from 'src/common/i18n/translations.decorator';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Giải pháp điều trị' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  label: string;

  @ApiProperty({ example: '/giai-phap-dieu-tri' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  href: string;

  @ApiPropertyOptional({ example: 1, description: 'ID menu cha (null = menu gốc)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    default: true,
    description: 'Mở khung danh mục con khi bấm (false = đi thẳng tới trang)',
  })
  @IsOptional()
  @IsBoolean()
  showSubmenu?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsTranslations()
  translations?: Record<string, Record<string, unknown>> | null;
}

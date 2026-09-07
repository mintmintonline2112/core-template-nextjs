// create-user.dto.ts
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountStatus } from 'src/common/enums/account-status.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'User 1' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({ example: 'https://placehold.co/200x200' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'user#123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'user#123' })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;

  @ApiPropertyOptional({ enum: AccountStatus, example: AccountStatus.ACTIVE })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main Street, City, Country' })
  @IsOptional()
  @IsString()
  address?: string;
}

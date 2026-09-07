import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { AccountType } from 'src/common/enums/account-type.enum';

export class CreateStaffDto {
  @ApiProperty({ example: 'ST101' })
  @IsString()
  @IsNotEmpty()
  staffCode: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    enum: AccountType,
    default: AccountType.STAFF,
  })
  @IsEnum(AccountType)
  @IsOptional()
  type: AccountType = AccountType.STAFF;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  role_id: number;

  @ApiProperty({
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  @IsEnum(AccountStatus)
  @IsOptional()
  status: AccountStatus = AccountStatus.ACTIVE;
}

// update-staff.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { AccountType } from 'src/common/enums/account-type.enum';

export class UpdateStaffDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    enum: AccountType,
    default: AccountType.STAFF,
  })
  @IsEnum(AccountType)
  @IsOptional()
  type: AccountType = AccountType.STAFF;

  @ApiProperty({ example: 'currentPassword123' })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @IsOptional()
  confirmPassword?: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsOptional()
  roleId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsNumber()
  @IsOptional()
  role_id?: number;

  @ApiProperty({ example: AccountStatus.ACTIVE, enum: AccountStatus })
  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;
}

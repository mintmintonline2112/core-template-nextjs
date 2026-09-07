import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UserRegisterDto {
  @ApiProperty({
    example: 'Nguyen Van A',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    example: 'example@gmail.com',
    maxLength: 255,
  })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    maxLength: 255,
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    message: 'Password phải có chữ và số',
  })
  password: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    maxLength: 255,
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  confirmPassword: string;

  @ApiPropertyOptional({
    example: '0123456789',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: '123 Đường ABC, Quận 1, TP.HCM',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;
}

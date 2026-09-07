import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({ example: 'a@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0123456789' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Hỏi sản phẩm', required: false })
  @IsOptional()
  subject?: string;

  @ApiProperty({ example: 'Tôi cần tư vấn...', minLength: 10 })
  @IsNotEmpty()
  @MinLength(10)
  message: string;
}

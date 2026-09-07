import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Đồng Minh Trường', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '0867862271', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ example: 'staff#123', required: false })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({ example: 'staff#123', required: false })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'staff#123', required: false })
  @IsString()
  @IsOptional()
  confirmPassword?: string;
}

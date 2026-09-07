import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ArrayUnique,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name', example: 'admin' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Administrator role',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Array of permission IDs',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  permissions?: number[];
}

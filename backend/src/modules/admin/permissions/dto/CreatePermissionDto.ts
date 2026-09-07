import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Name of the permission' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL of the permission' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'HTTP method', required: false, default: 'GET' })
  @IsString()
  @IsOptional()
  method?: string = 'GET';

  @ApiProperty({
    description: 'Description of the permission',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

import { PartialType } from '@nestjs/swagger';
import { CreatePageSectionDto } from './create-page-section.dto';

export class UpdatePageSectionDto extends PartialType(CreatePageSectionDto) {}

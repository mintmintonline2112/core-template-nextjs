import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { PageSection } from './entities/page-section.entity';

@Injectable()
export class PageSectionsService extends BaseService<PageSection, number> {
  constructor(
    @InjectRepository(PageSection)
    sectionRepo: Repository<PageSection>,
  ) {
    super(sectionRepo);
  }
}

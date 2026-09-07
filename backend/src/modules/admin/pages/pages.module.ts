import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { PageSection } from './entities/page-section.entity';
import { SectionDefinition } from './entities/section-definition.entity';
import { PagesController } from './pages.controller';
import { PageSectionsController } from './page-sections.controller';
import { SectionDefinitionsController } from './section-definitions.controller';
import { PagesService } from './pages.service';
import { PageSectionsService } from './page-sections.service';

@Module({
  imports: [TypeOrmModule.forFeature([Page, PageSection, SectionDefinition])],
  controllers: [
    PagesController,
    PageSectionsController,
    SectionDefinitionsController,
  ],
  providers: [PagesService, PageSectionsService],
  exports: [PagesService, PageSectionsService],
})
export class PagesModule {}

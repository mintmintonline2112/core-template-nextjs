import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { ClientPagesController } from './pages.controller';
import { ClientPagesService } from './pages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Page])],
  controllers: [ClientPagesController],
  providers: [ClientPagesService],
})
export class ClientPagesModule {}

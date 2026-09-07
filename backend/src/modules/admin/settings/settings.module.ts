import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSetting } from './site-setting.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { ClientSettingsController } from './client-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSetting])],
  controllers: [SettingsController, ClientSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}

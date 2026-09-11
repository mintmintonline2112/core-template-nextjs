import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/app-config.module';
import { Permission } from 'src/modules/admin/permissions/permissions.entity';
import { Role } from 'src/modules/admin/roles/roles.entity';
import { Staff } from 'src/modules/admin/staffs/staffs.entity';
import { DatabaseModule } from '../database.module';
import { SeedingService } from './seeding.service';
import { PermissionSeed } from './seeds/permission.seed';
import { RoleSeed } from './seeds/role.seed';
import { StaffSeed } from './seeds/staff.seed';
import { DiscoveryModule } from '@nestjs/core';
import { RolesModule } from 'src/modules/admin/roles/roles.module';
import { PermissionsModule } from 'src/modules/admin/permissions/permissions.module';
import { StaffsModule } from 'src/modules/admin/staffs/staffs.module';
import { BlogCategory } from 'src/modules/admin/blog-categories/entities/blog-category.entity';
import { BlogPost } from 'src/modules/admin/blog-posts/entities/blog-post.entity';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';
import { BlogSeed } from './seeds/blog.seed';
import { PageSeed } from './seeds/page.seed';
import { MenuItem } from 'src/modules/admin/menu-items/menu-item.entity';
import { SectionDefinition } from 'src/modules/admin/pages/entities/section-definition.entity';
import { SectionDefinitionSeed } from './seeds/section-definition.seed';
import { MenuSeed } from './seeds/menu.seed';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([
      Permission,
      Role,
      Staff,
      BlogCategory,
      BlogPost,
      Page,
      PageSection,
      SectionDefinition,
      MenuItem,
    ]),
    DiscoveryModule,
    RolesModule,
    PermissionsModule,
    StaffsModule,
  ],
  providers: [
    PermissionSeed,
    RoleSeed,
    StaffSeed,
    SeedingService,
    BlogSeed,
    PageSeed,
    SectionDefinitionSeed,
    MenuSeed,
  ],
})
export class SeedingModule {}

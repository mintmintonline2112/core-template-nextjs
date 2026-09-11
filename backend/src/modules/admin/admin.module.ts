import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { StaffsModule } from './staffs/staffs.module';
import { NotificationModule } from './notifications/notification.module';
import { BlogPostsModule } from './blog-posts/blog-posts.module';
import { BlogCategoriesModule } from './blog-categories/blog-categories.module';
import { PagesModule } from './pages/pages.module';
import { LibraryModule } from './library/library.module';
import { AdminCacheModule } from './cache/admin-cache.module';
import { ContactModule } from './contact/contact.module';
import { QuoteRequestsModule } from './quote-requests/quote-requests.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    AuthModule,
    RolesModule,
    PermissionsModule,
    StaffsModule,
    NotificationModule,
    BlogPostsModule,
    BlogCategoriesModule,
    PagesModule,
    LibraryModule,
    AdminCacheModule,
    ContactModule,
    QuoteRequestsModule,
    DashboardModule,
    MenuItemsModule,
    SettingsModule,
  ],
  exports: [
    AuthModule,
    RolesModule,
    PermissionsModule,
    StaffsModule,
  ],
})
export class AdminModule {}

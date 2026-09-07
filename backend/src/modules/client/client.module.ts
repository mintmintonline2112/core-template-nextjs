import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ContactModule } from '../admin/contact/contact.module';
import { QuoteRequestsModule } from '../admin/quote-requests/quote-requests.module';
import { ClientBlogPostsModule } from './blog-posts/blog-posts.module';
import { ClientPagesModule } from './pages/pages.module';

@Module({
  imports: [
    AuthModule,
    ContactModule,
    QuoteRequestsModule,
    ClientBlogPostsModule,
    ClientPagesModule,
  ],
  exports: [AuthModule],
})
export class ClientModule {}

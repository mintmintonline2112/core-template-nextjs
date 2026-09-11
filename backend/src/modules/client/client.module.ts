import { Module } from '@nestjs/common';
import { ContactModule } from '../admin/contact/contact.module';
import { QuoteRequestsModule } from '../admin/quote-requests/quote-requests.module';
import { ClientBlogPostsModule } from './blog-posts/blog-posts.module';
import { ClientPagesModule } from './pages/pages.module';

@Module({
  imports: [
    ContactModule,
    QuoteRequestsModule,
    ClientBlogPostsModule,
    ClientPagesModule,
  ],
})
export class ClientModule {}

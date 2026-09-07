import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadImageService } from 'src/modules/upload-image/upload-image.service';
import { BlogPost } from './entities/blog-post.entity';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsService } from './blog-posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost])],
  controllers: [BlogPostsController],
  providers: [BlogPostsService, UploadImageService],
  exports: [BlogPostsService],
})
export class BlogPostsModule {}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { UploadImageService } from 'src/modules/upload-image/upload-image.service';
import { generateUniqueSlug } from 'src/common/helpers/slug.helper';
import { BlogPost } from './entities/blog-post.entity';

@Injectable()
export class BlogPostsService extends BaseService<BlogPost, number> {
  constructor(
    @InjectRepository(BlogPost)
    private readonly postRepo: Repository<BlogPost>,
    private readonly uploadImageService: UploadImageService,
  ) {
    super(postRepo);
  }

  async createPost(
    dto: any,
    folder: string,
    opts: { skipOptimize?: boolean } = {},
  ): Promise<BlogPost> {
    let coverImagePath = dto.coverImagePath;
    if (
      dto.coverImagePath &&
      typeof dto.coverImagePath === 'object' &&
      'buffer' in dto.coverImagePath
    ) {
      coverImagePath = await this.uploadImageService.upload(dto.coverImagePath, folder, opts);
    }

    const slug = await generateUniqueSlug(this.postRepo, dto.slug || dto.title);
    const entity: DeepPartial<BlogPost> = {
      ...dto,
      coverImagePath: coverImagePath || undefined,
      slug,
    };
    return this.postRepo.save(this.postRepo.create(entity));
  }

  async updatePost(
    id: number,
    dto: any,
    folder: string,
    opts: { skipOptimize?: boolean } = {},
  ): Promise<BlogPost> {
    const existing = await this.postRepo.findOneBy({ id });
    if (!existing) throw new BadRequestException('Blog post not found');

    let coverImagePath = existing.coverImagePath;
    if (
      dto.coverImagePath &&
      typeof dto.coverImagePath === 'object' &&
      'buffer' in dto.coverImagePath
    ) {
      coverImagePath = await this.uploadImageService.upload(dto.coverImagePath, folder, opts);
    } else if (dto.coverImagePath !== undefined) {
      coverImagePath = dto.coverImagePath;
    }

    let slug = existing.slug;
    if (dto.slug !== undefined) {
      slug = await generateUniqueSlug(
        this.postRepo,
        dto.slug || dto.title || existing.title,
        { excludeId: id },
      );
    }

    return this.postRepo.save({
      ...existing,
      ...dto,
      coverImagePath,
      slug,
    });
  }
}

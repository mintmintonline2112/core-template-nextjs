import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { applyTranslations, type Lang } from 'src/common/i18n/translations';
import { BlogPost } from 'src/modules/admin/blog-posts/entities/blog-post.entity';
import { BlogCategory } from 'src/modules/admin/blog-categories/entities/blog-category.entity';

@Injectable()
export class ClientBlogPostsService extends BaseService<BlogPost, number> {
  constructor(
    @InjectRepository(BlogPost)
    protected readonly postRepo: Repository<BlogPost>,
    @InjectRepository(BlogCategory)
    private readonly categoryRepo: Repository<BlogCategory>,
  ) {
    super(postRepo);
  }

  /**
   * Danh mục ra public: `displayName` (nếu có) thay `name` — tên dashboard như
   * "Ca Veneer" chỉ để admin phân biệt, website hiện "Veneer"; rồi merge bản dịch.
   */
  static publicCategory<T extends BlogCategory | null>(
    category: T,
    lang: Lang,
  ): T {
    if (!category) return category;
    const displayName = category.displayName?.trim();
    const named = displayName
      ? ({ ...category, name: displayName } as T)
      : category;
    return applyTranslations(named, lang);
  }

  /** Bài + danh mục kèm theo đều merge bản dịch (fallback tiếng Việt). */
  static localizePost<T extends BlogPost | null>(post: T, lang: Lang): T {
    if (!post) return post;
    const localized = lang === 'vi' ? post : applyTranslations(post, lang);
    return {
      ...localized,
      category: ClientBlogPostsService.publicCategory(post.category, lang),
    } as T;
  }

  async findActiveCategories(lang: Lang = 'vi'): Promise<BlogCategory[]> {
    const rows = await this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
      select: [
        'id',
        'name',
        'displayName',
        'slug',
        'parentId',
        'sortOrder',
        'translations',
      ],
    });
    return rows.map((row) =>
      ClientBlogPostsService.publicCategory(row, lang),
    );
  }

  async findPublishedBySlug(
    slug: string,
    lang: Lang = 'vi',
  ): Promise<BlogPost | null> {
    const post = await this.postRepo.findOne({
      where: {
        slug,
        status: PublishStatus.PUBLISHED,
        publishedAt: LessThanOrEqual(new Date()),
      },
      relations: { category: true },
    });
    return ClientBlogPostsService.localizePost(post, lang);
  }
}

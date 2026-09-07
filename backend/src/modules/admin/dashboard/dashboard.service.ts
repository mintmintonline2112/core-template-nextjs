import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { BlogCategory } from '../blog-categories/entities/blog-category.entity';
import { BlogPost } from '../blog-posts/entities/blog-post.entity';
import { ContactEntity } from '../contact/entities/contact.entity';
import { PageSection } from '../pages/entities/page-section.entity';
import { Page } from '../pages/entities/page.entity';
import { Staff } from '../staffs/staffs.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepo: Repository<BlogPost>,
    @InjectRepository(BlogCategory)
    private readonly blogCategoryRepo: Repository<BlogCategory>,
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(PageSection)
    private readonly pageSectionRepo: Repository<PageSection>,
    @InjectRepository(ContactEntity)
    private readonly contactRepo: Repository<ContactEntity>,
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

  async getSummary() {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      blogPosts,
      publishedBlogPosts,
      draftBlogPosts,
      categories,
      pages,
      publishedPages,
      sections,
      contacts,
      contactsThisMonth,
      staff,
      activeStaff,
      recentPosts,
      recentContacts,
    ] = await Promise.all([
      this.blogPostRepo.count(),
      this.blogPostRepo.count({ where: { status: PublishStatus.PUBLISHED } }),
      this.blogPostRepo.count({ where: { status: PublishStatus.DRAFT } }),
      this.blogCategoryRepo.count(),
      this.pageRepo.count(),
      this.pageRepo.count({ where: { status: PublishStatus.PUBLISHED } }),
      this.pageSectionRepo.count(),
      this.contactRepo.count(),
      this.contactRepo.count({
        where: { createdAt: MoreThanOrEqual(monthStart) },
      }),
      this.staffRepo.count(),
      this.staffRepo.count({ where: { status: AccountStatus.ACTIVE } }),
      this.blogPostRepo.find({
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
        },
        order: { updatedAt: 'DESC' },
        take: 5,
      }),
      this.contactRepo.find({
        select: {
          id: true,
          fullname: true,
          email: true,
          subject: true,
          createdAt: true,
        },
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);

    return {
      content: {
        blogPosts,
        publishedBlogPosts,
        draftBlogPosts,
        categories,
        pages,
        publishedPages,
        sections,
      },
      contacts: { total: contacts, thisMonth: contactsThisMonth },
      staff: { total: staff, active: activeStaff },
      recentPosts,
      recentContacts,
    };
  }
}

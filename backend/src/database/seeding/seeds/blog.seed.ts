import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { BlogCategory } from 'src/modules/admin/blog-categories/entities/blog-category.entity';
import { BlogPost } from 'src/modules/admin/blog-posts/entities/blog-post.entity';

/**
 * Chuyên mục + 2 bài mẫu để trang Tin tức có sẵn nội dung mà bấm thử.
 * Insert-only theo slug: chạy lại db:seed an toàn, bài admin đã sửa giữ nguyên.
 * KHI TẠO SITE MỚI: đổi chuyên mục cho đúng ngành, xoá 2 bài mẫu trong dashboard.
 */
@Injectable()
export class BlogSeed {
  constructor(
    @InjectRepository(BlogCategory)
    private readonly categoryRepo: Repository<BlogCategory>,
    @InjectRepository(BlogPost)
    private readonly postRepo: Repository<BlogPost>,
  ) {}

  async run(): Promise<void> {
    const categories = [
      {
        name: 'Tin công ty',
        slug: 'tin-cong-ty',
        description: 'Thông báo và cập nhật từ công ty',
        sortOrder: 1,
      },
      {
        name: 'Kiến thức',
        slug: 'kien-thuc',
        description: 'Hướng dẫn và chia sẻ chuyên môn cho khách hàng',
        sortOrder: 2,
      },
    ];

    for (const category of categories) {
      const existing = await this.categoryRepo.findOneBy({
        slug: category.slug,
      });
      if (existing) continue;
      await this.categoryRepo.save(this.categoryRepo.create(category));
    }

    const savedCategories = await this.categoryRepo.find();
    const categoryId = new Map(
      savedCategories.map((item) => [item.slug, item.id]),
    );

    const posts: Partial<BlogPost>[] = [
      {
        title: 'Bài viết mẫu: cách soạn một bài chuẩn SEO',
        slug: 'bai-viet-mau-cach-soan-mot-bai-chuan-seo',
        categoryId: categoryId.get('kien-thuc'),
        excerpt:
          'Đoạn tóm tắt hiện trên thẻ bài viết và kết quả tìm kiếm — viết 1–2 câu nêu đúng ích lợi người đọc nhận được.',
        content:
          '<p>Đây là bài mẫu để bạn thấy trang chi tiết bài viết trông ra sao. Vào Admin → Bài viết để sửa hoặc xoá.</p>' +
          '<h2>Đặt tiêu đề phụ rõ ràng</h2>' +
          '<p>Mỗi phần một ý, đoạn ngắn 3–4 dòng cho dễ đọc trên điện thoại. Chèn ảnh minh hoạ ở những chỗ cần giải thích.</p>' +
          '<h2>Đừng quên phần SEO</h2>' +
          '<p>Điền tiêu đề SEO và mô tả trong tab SEO của bài; để trống thì hệ thống tự lấy tiêu đề và đoạn tóm tắt.</p>',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
        sortOrder: 1,
      },
      {
        title: 'Bài viết mẫu: thông báo từ công ty',
        slug: 'bai-viet-mau-thong-bao-tu-cong-ty',
        categoryId: categoryId.get('tin-cong-ty'),
        excerpt:
          'Dùng chuyên mục này cho thông báo dịch vụ mới, lịch nghỉ lễ, tuyển dụng hoặc hoạt động của công ty.',
        content:
          '<p>Bài mẫu thứ hai, nằm ở chuyên mục khác để bạn thử bộ lọc chuyên mục ngoài trang Tin tức.</p>' +
          '<p>Xoá hai bài mẫu này sau khi đã có nội dung thật.</p>',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
        sortOrder: 2,
      },
    ];

    let created = 0;
    for (const post of posts) {
      const existing = await this.postRepo.findOneBy({ slug: post.slug });
      if (existing) continue;
      await this.postRepo.save(this.postRepo.create(post));
      created++;
    }

    console.log(
      created > 0
        ? `--- [Seed] Blog: created ${created} post(s).`
        : '--- [Seed] Blog: nothing missing, skipping.',
    );
  }
}

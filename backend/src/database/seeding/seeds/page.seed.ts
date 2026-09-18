import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';

export type PageDefinition = {
  page: DeepPartial<Page> & { slug: string };
  sections: Array<DeepPartial<PageSection> & { sectionKey: string }>;
};

/** Ảnh minh hoạ của khung mẫu — thay bằng ảnh thật trong Admin → Thư viện. */
const PHOTO_WIDE = '/images/placeholder-wide.svg';
const PHOTO_SQUARE = '/images/placeholder-square.svg';

/**
 * NỘI DUNG KHỞI TẠO của khung mẫu — cài xong là có ngay một website chạy được
 * để bấm thử, rồi admin sửa dần trong dashboard.
 *
 * Mỗi section: sectionKey = id neo trên trang (menu trỏ vào nên giữ ổn định),
 * metadata._component = component trong registry frontend, metadata.layout = bố cục.
 * Insert-only theo slug/sectionKey: trang đã tồn tại (kể cả admin đã sửa) giữ
 * nguyên, chỉ bổ sung key metadata còn thiếu; chạy lại db:seed an toàn.
 *
 * KHI TẠO SITE MỚI: viết lại toàn bộ nội dung bên dưới cho đúng ngành của khách,
 * hoặc xoá bớt section không dùng. Component thì giữ nguyên, đừng xoá khỏi registry.
 */
export const PAGES: PageDefinition[] = [
  {
    page: {
      title: 'Trang chủ',
      slug: 'home',
      eyebrow: 'Giải pháp cho doanh nghiệp',
      lead: 'Một dòng giới thiệu ngắn gọn về việc công ty bạn giúp khách hàng giải quyết vấn đề gì.',
      templateKey: 'home',
      status: PublishStatus.PUBLISHED,
      sortOrder: 1,
      metaDescription:
        'Mô tả ngắn 120–160 ký tự cho kết quả tìm kiếm Google. Nêu rõ bạn làm gì và cho ai.',
    },
    sections: [
      {
        sectionKey: 'hero',
        heading: 'Tiêu đề chính của trang chủ',
        subheading: 'Dòng nhỏ phía trên',
        content:
          '<p>Đoạn mở đầu nói rõ bạn làm gì, cho ai, và vì sao khách nên chọn bạn.</p>',
        metadata: {
          _component: 'hero',
          layout: 'slider',
          slides: [
            {
              image: PHOTO_WIDE,
              title: 'Tiêu đề chính của trang chủ',
              text: 'Đoạn mở đầu nói rõ bạn làm gì, cho ai, và vì sao khách nên chọn bạn.\n\nMỗi slide có một ảnh nền, một tiêu đề và một đoạn mô tả ngắn.',
              alt: 'Ảnh minh hoạ',
            },
            {
              image: PHOTO_WIDE,
              title: 'Slide thứ hai',
              text: 'Thêm hoặc bớt slide trong Admin → Trang → Section, không cần sửa code.',
              alt: 'Ảnh minh hoạ',
            },
          ],
          ctaLabel: 'Nhận tư vấn miễn phí',
          ctaHref: '#request-quote',
          cta2Label: 'Xem dịch vụ',
          cta2Href: '/products',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'gioi-thieu',
        heading: 'Vì sao khách hàng chọn chúng tôi',
        subheading: 'Giới thiệu',
        content:
          '<p>Hai ba câu giới thiệu công ty: bạn làm nghề này bao lâu, phục vụ nhóm khách nào, điểm khác biệt nằm ở đâu.</p>',
        metadata: {
          _component: 'feature-list',
          layout: 'split',
          items: [
            { label: 'Điểm mạnh thứ nhất' },
            { label: 'Điểm mạnh thứ hai' },
            { label: 'Điểm mạnh thứ ba' },
            { label: 'Điểm mạnh thứ tư' },
            { label: 'Điểm mạnh thứ năm' },
            { label: 'Điểm mạnh thứ sáu' },
          ],
          chips: [],
          image: PHOTO_WIDE,
          note: 'Một câu chốt lại giá trị bạn mang cho khách hàng.',
        },
        sortOrder: 2,
      },
      {
        sectionKey: 'dich-vu',
        heading: 'Dịch vụ chính',
        subheading: 'Chúng tôi làm gì',
        content:
          '<p>Liệt kê các nhóm dịch vụ chính, mỗi ô một câu ngắn để khách quét nhanh.</p>',
        metadata: {
          _component: 'icon-card-list',
          layout: 'split',
          items: [
            { title: 'Dịch vụ một', text: 'Một câu mô tả dịch vụ này làm gì cho khách.', icon: 'building' },
            { title: 'Dịch vụ hai', text: 'Một câu mô tả dịch vụ này làm gì cho khách.', icon: 'tune' },
            { title: 'Dịch vụ ba', text: 'Một câu mô tả dịch vụ này làm gì cho khách.', icon: 'scale' },
            { title: 'Dịch vụ bốn', text: 'Một câu mô tả dịch vụ này làm gì cho khách.', icon: 'product' },
            { title: 'Dịch vụ năm', text: 'Một câu mô tả dịch vụ này làm gì cho khách.', icon: 'calendar' },
            { title: 'Dịch vụ sáu', text: 'Một câu mô tả dịch vụ này làm gì cho khách.', icon: 'box' },
          ],
          ctaLabel: 'Trao đổi với chúng tôi',
          ctaHref: '#request-quote',
          image: PHOTO_SQUARE,
          imageAlt: 'Ảnh minh hoạ',
          image2: PHOTO_WIDE,
          image2Alt: 'Ảnh minh hoạ',
          badge: '',
        },
        sortOrder: 3,
      },
      {
        sectionKey: 'quy-trinh',
        heading: 'Quy trình làm việc',
        subheading: 'Từ trao đổi tới bàn giao',
        content:
          '<p>Cho khách thấy trước các bước sẽ diễn ra — khách bớt lo và hỏi ít hơn.</p>',
        metadata: {
          _component: 'steps',
          layout: 'circles',
          items: [
            { title: 'Tiếp nhận yêu cầu', text: 'Khách để lại thông tin, chúng tôi liên hệ trong vòng 24 giờ làm việc.' },
            { title: 'Khảo sát và tư vấn', text: 'Cùng khách làm rõ mục tiêu, phạm vi và ngân sách phù hợp.' },
            { title: 'Báo giá và ký kết', text: 'Gửi đề xuất chi tiết kèm thời gian thực hiện và cam kết bàn giao.' },
            { title: 'Triển khai và bàn giao', text: 'Thực hiện theo mốc đã thống nhất, báo cáo tiến độ định kỳ.' },
          ],
          slides: [],
          ctaLabel: 'Bắt đầu ngay',
          ctaHref: '#request-quote',
        },
        sortOrder: 4,
      },
      {
        sectionKey: 'faq',
        heading: 'Câu hỏi thường gặp',
        subheading: 'Giải đáp nhanh',
        content: '',
        metadata: {
          _component: 'faq',
          layout: 'columns',
          headingAccent: 'thường gặp',
          items: [
            { question: 'Chi phí được tính thế nào?', answer: 'Trả lời ngắn gọn, thẳng vào câu hỏi. Đây cũng là nội dung Google hay lấy hiển thị trên kết quả tìm kiếm.' },
            { question: 'Mất bao lâu để hoàn thành?', answer: 'Nêu khoảng thời gian thực tế theo từng loại dự án.' },
            { question: 'Sau khi bàn giao có hỗ trợ không?', answer: 'Nêu rõ chính sách bảo hành và hỗ trợ sau bàn giao.' },
            { question: 'Thanh toán theo hình thức nào?', answer: 'Nêu các đợt thanh toán và phương thức chấp nhận.' },
          ],
        },
        sortOrder: 5,
      },
      {
        sectionKey: 'request-quote',
        heading: 'Nhận tư vấn và báo giá',
        subheading: 'Liên hệ',
        content:
          '<p>Để lại thông tin, chúng tôi liên hệ lại trong vòng 24 giờ làm việc.</p>',
        metadata: {
          _component: 'quote-form',
          items: [
            'Loại dịch vụ quan tâm',
            'Quy mô và phạm vi mong muốn',
            'Ngân sách dự kiến',
            'Thời điểm cần hoàn thành',
          ],
          note: 'Thông tin của bạn chỉ dùng để liên hệ tư vấn, không chia sẻ cho bên thứ ba.',
        },
        sortOrder: 6,
      },
    ],
  },
  {
    page: {
      title: 'Dịch vụ',
      slug: 'products',
      eyebrow: 'Dịch vụ',
      lead: 'Giới thiệu chi tiết từng nhóm dịch vụ và cam kết đi kèm.',
      status: PublishStatus.PUBLISHED,
      sortOrder: 2,
      metaDescription: 'Mô tả ngắn cho trang dịch vụ, 120–160 ký tự.',
    },
    sections: [
      {
        sectionKey: 'dich-vu-noi-bat',
        heading: 'Các gói dịch vụ',
        subheading: 'Chọn gói phù hợp',
        content:
          '<p>Mỗi thẻ là một gói dịch vụ: tên gói, một câu tóm tắt và phần mô tả chi tiết khi khách bấm vào.</p>',
        metadata: {
          _component: 'media-cards',
          layout: 'toggle',
          items: [
            { title: 'Gói cơ bản', short: 'Phù hợp doanh nghiệp mới bắt đầu.', text: 'Mô tả chi tiết gói cơ bản: gồm những hạng mục nào, phù hợp với ai.', image: PHOTO_SQUARE },
            { title: 'Gói tiêu chuẩn', short: 'Lựa chọn phổ biến nhất.', text: 'Mô tả chi tiết gói tiêu chuẩn: thêm những gì so với gói cơ bản.', image: PHOTO_SQUARE },
            { title: 'Gói nâng cao', short: 'Dành cho dự án quy mô lớn.', text: 'Mô tả chi tiết gói nâng cao: dành cho khách có yêu cầu riêng.', image: PHOTO_SQUARE },
          ],
          sizes: [],
          ctaLabel: 'Hỏi báo giá',
          ctaHref: '/contact',
          note: 'Có thể thiết kế gói riêng theo yêu cầu.',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'cam-ket',
        heading: 'Cam kết khi làm việc cùng chúng tôi',
        subheading: 'Cam kết',
        content: '',
        metadata: {
          _component: 'checklist',
          items: [
            'Báo giá minh bạch, không phát sinh ngoài hợp đồng',
            'Có người phụ trách xuyên suốt dự án',
            'Báo cáo tiến độ định kỳ',
            'Bàn giao đầy đủ tài khoản và tài liệu',
            'Hỗ trợ sau bàn giao',
          ],
          note: 'Cần trao đổi thêm? <a href="/contact">Liên hệ với chúng tôi</a>.',
        },
        sortOrder: 2,
      },
    ],
  },
  {
    page: {
      title: 'Tin tức',
      slug: 'news',
      eyebrow: 'Tin tức',
      lead: 'Bài viết, hướng dẫn và cập nhật từ đội ngũ của chúng tôi.',
      status: PublishStatus.PUBLISHED,
      sortOrder: 3,
      metaDescription: 'Bài viết, hướng dẫn và tin tức mới nhất.',
    },
    sections: [],
  },
  {
    page: {
      title: 'Liên hệ',
      slug: 'contact',
      eyebrow: 'Liên hệ',
      lead: 'Để lại thông tin hoặc gọi trực tiếp, chúng tôi luôn sẵn sàng.',
      status: PublishStatus.PUBLISHED,
      sortOrder: 4,
      metaDescription: 'Thông tin liên hệ và biểu mẫu gửi yêu cầu tư vấn.',
    },
    sections: [
      {
        sectionKey: 'contact-details',
        heading: 'Liên hệ với chúng tôi',
        subheading: 'Kết nối',
        content:
          '<p>Gửi yêu cầu qua biểu mẫu bên cạnh, hoặc gọi trực tiếp trong giờ làm việc.</p>',
        metadata: {
          _component: 'contact',
          layout: 'form',
          note: 'Chúng tôi phản hồi trong vòng 24 giờ làm việc.',
          image: PHOTO_WIDE,
          imageAlt: 'Ảnh minh hoạ',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'quote-checklist',
        heading: 'Gửi trước những thông tin này để được báo giá nhanh',
        subheading: 'Báo giá nhanh hơn',
        content:
          '<p>Càng nhiều thông tin, báo giá càng sát với nhu cầu thật của bạn.</p>',
        metadata: {
          _component: 'checklist',
          items: [
            'Lĩnh vực kinh doanh',
            'Dịch vụ đang quan tâm',
            'Phạm vi công việc mong muốn',
            'Ngân sách dự kiến',
            'Thời điểm cần hoàn thành',
          ],
          note: 'Hoặc dùng <a href="/#request-quote">biểu mẫu chi tiết</a> ở trang chủ.',
        },
        sortOrder: 2,
      },
    ],
  },
];

@Injectable()
export class PageSeed {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(PageSection)
    private readonly sectionRepo: Repository<PageSection>,
  ) {}

  async run(): Promise<void> {
    let createdPages = 0;
    let createdSections = 0;
    let mergedSections = 0;

    for (const definition of PAGES) {
      let page = await this.pageRepo.findOne({
        where: { slug: definition.page.slug },
        withDeleted: true,
      });

      if (!page) {
        page = await this.pageRepo.save(this.pageRepo.create(definition.page));
        createdPages++;
      }

      for (const section of definition.sections) {
        const existing = await this.sectionRepo.findOne({
          where: { pageId: page.id, sectionKey: section.sectionKey },
          withDeleted: true,
        });

        if (existing) {
          // Bổ sung key metadata mới của seed vào section cũ — KHÔNG đè
          // key đã có (giữ chỉnh sửa của admin), chạy lại db:seed an toàn.
          const seedMeta = (section.metadata ?? {}) as Record<string, unknown>;
          const currentMeta = (existing.metadata ?? {}) as Record<string, unknown>;
          const missing = Object.keys(seedMeta).filter(
            (key) => !(key in currentMeta),
          );
          if (missing.length > 0) {
            existing.metadata = {
              ...currentMeta,
              ...Object.fromEntries(missing.map((key) => [key, seedMeta[key]])),
            };
            await this.sectionRepo.save(existing);
            mergedSections++;
          }
          continue;
        }

        await this.sectionRepo.save(
          this.sectionRepo.create({ ...section, pageId: page.id }),
        );
        createdSections++;
      }
    }

    console.log(
      createdPages + createdSections + mergedSections > 0
        ? `--- [Seed] Pages: created ${createdPages} page(s), ${createdSections} section(s); merged metadata into ${mergedSections} section(s).`
        : '--- [Seed] Pages: nothing missing, skipping.',
    );
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SectionDefinition,
  SectionFieldSpec,
} from 'src/modules/admin/pages/entities/section-definition.entity';

type DefinitionSeed = {
  pageSlug: string;
  sectionKey: string;
  label: string;
  description: string;
  fields: SectionFieldSpec[];
  sortOrder: number;
};

const IMAGE_HINT =
  'Ảnh: bấm "Thư viện" để chọn ảnh đã upload, hoặc dán /images/... (ảnh có sẵn của thiết kế).';

/* Cấu trúc metadata dùng lại giữa section trang chuẩn và component thư viện. */
const STATS: SectionFieldSpec[] = [
  {
    key: 'stats', label: 'Số liệu nổi bật', type: 'itemList',
    hint: 'Giá trị có số ở đầu sẽ tự chạy hiệu ứng đếm (VD: 4+, 6).',
    itemFields: [
      { name: 'label', label: 'Nhãn', kind: 'text' },
      { name: 'value', label: 'Giá trị', kind: 'text' },
    ],
  },
];

const REGIONS: SectionFieldSpec[] = [
  {
    key: 'regions', label: 'Khu vực trên bản đồ', type: 'json',
    hint: 'Cấu trúc [{key,name,countries[]}]. key phải thuộc us/na/ap/sa/me/eu để ghim trên bản đồ sáng đúng khu vực.',
  },
];

const VARIETIES_OVERVIEW: SectionFieldSpec[] = [
  { key: 'varieties', label: 'Giống hạnh nhân', type: 'stringList' },
  { key: 'sizes', label: 'Cỡ hạt (kernels/oz)', type: 'stringList' },
  {
    key: 'photos', label: 'Dải ảnh', type: 'itemList', hint: IMAGE_HINT,
    itemFields: [
      { name: 'image', label: 'Ảnh', kind: 'image' },
      { name: 'caption', label: 'Chú thích', kind: 'text' },
    ],
  },
];

const titleTextList = (key: string, label: string, hint?: string): SectionFieldSpec => ({
  key, label, type: 'itemList', ...(hint ? { hint } : {}),
  itemFields: [
    { name: 'title', label: 'Tiêu đề', kind: 'text' },
    { name: 'text', label: 'Mô tả', kind: 'textarea' },
  ],
});

const SLIDES_AND_CHAIN: SectionFieldSpec[] = [
  {
    key: 'slides', label: 'Ảnh slider', type: 'itemList', hint: IMAGE_HINT,
    itemFields: [
      { name: 'image', label: 'Ảnh', kind: 'image' },
      { name: 'caption', label: 'Chú thích', kind: 'text' },
    ],
  },
  {
    key: 'chain', label: 'Các bước', type: 'stringList',
    hint: 'Mỗi bước là một nút bấm được: bấm bước số N sẽ chuyển slider tới ảnh số N. Nên để số bước bằng số ảnh ở trên.',
  },
];

const documentsList = (label: string, chipsLabel: string): SectionFieldSpec[] => [
  {
    key: 'documents', label, type: 'itemList',
    hint: 'Ghi chú (nếu có) hiện chữ nghiêng nhỏ dưới tên mục.',
    itemFields: [
      { name: 'label', label: 'Tên mục', kind: 'text' },
      { name: 'note', label: 'Ghi chú', kind: 'text' },
    ],
  },
  { key: 'incoterms', label: chipsLabel, type: 'stringList' },
];

const AUDIENCES: SectionFieldSpec[] = [
  { key: 'audiences', label: 'Nhóm khách hàng', type: 'stringList' },
];

const CHECKLIST: SectionFieldSpec[] = [
  { key: 'checklist', label: 'Danh sách mục', type: 'stringList' },
];

const SIZES: SectionFieldSpec[] = [
  { key: 'sizes', label: 'Cỡ hạt (kernels/oz)', type: 'stringList' },
];

/**
 * DANH MỤC COMPONENT — nguồn chân lý do code quản lý.
 *
 * QUY TẮC TÊN: sectionKey (kebab-case) = tên file component (PascalCase) trong
 * frontend/src/app/(site)/_components/sections/ = id neo trên trang.
 *  - pageSlug home / products / contact: SECTION của trang chuẩn
 *    (VD product-specs ↔ ProductSpecs.tsx ↔ /#product-specs).
 *  - pageSlug shared: COMPONENT THƯ VIỆN giữ để tái sử dụng trên trang tự tạo
 *    (VD icon-card-list ↔ IconCardList.tsx).
 *
 * Seed UPSERT theo sectionKey (ghi đè label/mô tả/spec mỗi lần chạy) để danh mục
 * luôn khớp code; dữ liệu section của admin không bị đụng tới.
 */
const DEFINITIONS: DefinitionSeed[] = [
  /* ---------------- Home ---------------- */
  {
    pageSlug: 'home', sectionKey: 'hero-slider', sortOrder: 1,
    label: 'Home · Hero slider',
    description: 'HeroSlider.tsx — ảnh nền chuyển slide, tiêu đề + mô tả bên trái đổi theo slide, dãy số slide bên phải; nút CTA và số liệu cố định.',
    fields: [
      {
        key: 'slides', label: 'Slide', type: 'itemList',
        hint: IMAGE_HINT + ' Tiêu đề / mô tả để trống thì dùng Heading / Nội dung của section. Mô tả: xuống dòng 2 lần để tách đoạn.',
        itemFields: [
          { name: 'image', label: 'Ảnh nền', kind: 'image' },
          { name: 'title', label: 'Tiêu đề', kind: 'text' },
          { name: 'text', label: 'Mô tả', kind: 'textarea' },
        ],
      },
      ...STATS,
    ],
  },
  {
    pageSlug: 'home', sectionKey: 'about-map', sortOrder: 2,
    label: 'Home · About + bản đồ thế giới',
    description: 'AboutMap.tsx — giới thiệu công ty và bản đồ tương tác 6 khu vực.',
    fields: REGIONS,
  },
  {
    pageSlug: 'home', sectionKey: 'about-map-regions', sortOrder: 2,
    label: 'Home · About + danh sách khu vực (bản tương tác)',
    description: 'AboutMapRegions.tsx — phiên bản khác của about-map: danh sách khu vực bên trái (bấm để xem các nước), bản đồ bên phải sáng đúng khu vực đang chọn.',
    fields: [
      {
        key: 'regions', label: 'Khu vực', type: 'json',
        hint: 'Cấu trúc [{key,name,countries[]}] — key thuộc us/na/ap/sa/me/eu. Để trống dùng 6 khu vực mặc định; countries trống thì lấy theo ghim trên bản đồ.',
      },
    ],
  },
  {
    pageSlug: 'home', sectionKey: 'almond-varieties', sortOrder: 3,
    label: 'Home · Giống hạnh nhân + cỡ hạt + dải ảnh',
    description: 'AlmondVarieties.tsx — ảnh tròn đánh số từng giống, thước cỡ hạt, dải 3 ảnh.',
    fields: VARIETIES_OVERVIEW,
  },
  {
    pageSlug: 'home', sectionKey: 'product-specs', sortOrder: 4,
    label: 'Home · Thông số sản phẩm',
    description: 'ProductSpecs.tsx — ảnh kho + ảnh tàu, mỗi dòng một thông số (tiêu đề + giá trị), icon theo thứ tự.',
    fields: [titleTextList('configurations', 'Dòng thông số')],
  },
  {
    pageSlug: 'home', sectionKey: 'how-it-works', sortOrder: 5,
    label: 'Home · How It Works (slider + ô bước)',
    description: 'HowItWorks.tsx — nền navy, slider ảnh tự chạy và chuỗi ô bước bấm được.',
    fields: SLIDES_AND_CHAIN,
  },
  {
    pageSlug: 'home', sectionKey: 'working-process', sortOrder: 6,
    label: 'Home · Working Process (bước vòng tròn)',
    description: 'WorkingProcess.tsx — các bước đánh số trong vòng tròn nối bằng đường cong nét đứt, nền kem có bản đồ mờ.',
    fields: [titleTextList('steps', 'Các bước', 'Nên 3–5 bước để các vòng tròn nằm trên một hàng ở màn hình lớn.')],
  },
  {
    pageSlug: 'home', sectionKey: 'sourcing-services', sortOrder: 7,
    label: 'Home · Dịch vụ sourcing & procurement',
    description: 'SourcingServices.tsx — danh sách dịch vụ kẹp hai bên ảnh tròn và dải câu mục tiêu; chip để trống thì ẩn.',
    fields: documentsList('Dịch vụ', 'Chip (tuỳ chọn)'),
  },
  {
    pageSlug: 'home', sectionKey: 'buyers-marquee', sortOrder: 8,
    label: 'Home · Nhóm khách hàng (chữ chạy)',
    description: 'BuyersMarquee.tsx — tiêu đề nhỏ (heading) và 2 dòng chữ chạy ngang ngược chiều.',
    fields: AUDIENCES,
  },
  {
    pageSlug: 'home', sectionKey: 'why-us', sortOrder: 9,
    label: 'Home · Why Prime Nuts USA (thẻ lý do)',
    description: 'WhyUs.tsx — lưới thẻ lý do nền navy, icon giữ theo thứ tự thẻ.',
    fields: [titleTextList('reasons', 'Thẻ lý do')],
  },
  {
    pageSlug: 'home', sectionKey: 'faq', sortOrder: 9,
    label: 'Home · FAQ (accordion 2 cột)',
    description: 'Faq.tsx — mỗi câu là thẻ trắng viền trái có dấu +, bấm để mở câu trả lời; tự chia 2 cột hoặc theo nhóm.',
    fields: [
      {
        key: 'items', label: 'Câu hỏi', type: 'itemList',
        hint: 'Nhóm (tuỳ chọn): các câu cùng tên nhóm gom thành 1 cột có tiêu đề; để trống thì tự chia đều 2 cột. Câu trả lời: xuống dòng 2 lần để tách đoạn.',
        itemFields: [
          { name: 'question', label: 'Câu hỏi', kind: 'text' },
          { name: 'answer', label: 'Câu trả lời', kind: 'textarea' },
          { name: 'group', label: 'Nhóm (tuỳ chọn)', kind: 'text' },
        ],
      },
      {
        key: '__self__', label: 'Tiêu đề', type: 'textMap',
        fields: [{ name: 'headingAccent', label: 'Phần tiêu đề tô màu (phải nằm trong Heading)' }],
      },
    ],
  },
  {
    pageSlug: 'home', sectionKey: 'request-quote', sortOrder: 10,
    label: 'Home · Form báo giá + checklist',
    description: 'RequestQuote.tsx — khối chốt trang: checklist "Please include" và form báo giá gửi API thật.',
    fields: [{ key: 'checklist', label: 'Please include', type: 'stringList' }],
  },

  /* ---------------- Products ---------------- */
  {
    pageSlug: 'products', sectionKey: 'natural-almonds', sortOrder: 1,
    label: 'Products · Giống hạnh nhân tự nhiên',
    description: 'NaturalAlmonds.tsx — ảnh lớn và lưới thẻ giống (ảnh, số thứ tự, mô tả).',
    fields: [
      {
        key: 'varieties', label: 'Giống hạnh nhân', type: 'stringList',
        hint: 'Tên trùng bộ mặc định (Nonpareil, Carmel…) sẽ giữ nguyên ảnh + mô tả có sẵn.',
      },
    ],
  },
  {
    pageSlug: 'products', sectionKey: 'processed-almonds', sortOrder: 2,
    label: 'Products · Định dạng chế biến',
    description: 'ProcessedAlmonds.tsx — lưới thẻ định dạng, dải 2 ảnh và dải ghi chú.',
    fields: [
      {
        key: 'formats', label: 'Định dạng chế biến', type: 'stringList',
        hint: 'Tên trùng bộ mặc định (Blanched, Sliced…) sẽ giữ nguyên ảnh + mô tả + icon có sẵn.',
      },
    ],
  },
  {
    pageSlug: 'products', sectionKey: 'kernel-sizes', sortOrder: 3,
    label: 'Products · Thước cỡ hạt',
    description: 'KernelSizes.tsx — thước đo cỡ hạt và ghi chú.',
    fields: SIZES,
  },

  /* ---------------- Contact ---------------- */
  {
    pageSlug: 'contact', sectionKey: 'contact-details', sortOrder: 1,
    label: 'Contact · Thông tin liên hệ + form',
    description: 'ContactDetails.tsx — thông tin công ty lấy từ Admin → Trang Liên hệ; section chỉ chỉnh eyebrow và tiêu đề dự phòng.',
    fields: [],
  },
  {
    pageSlug: 'contact', sectionKey: 'quote-checklist', sortOrder: 2,
    label: 'Contact · Checklist báo giá',
    description: 'QuoteChecklist.tsx — lưới các mục nên cung cấp khi yêu cầu báo giá.',
    fields: CHECKLIST,
  },

  /* ---------------- Thư viện (tái sử dụng trên trang tự tạo) ---------------- */
  {
    pageSlug: 'shared', sectionKey: 'hero-stats', sortOrder: 0,
    label: 'Thư viện · Hero tĩnh + số liệu',
    description: 'HeroStats.tsx — hero cũ của trang chủ: tiêu đề, giới thiệu, 2 nút CTA, số liệu, ảnh tràn mép phải. Giữ lại để dùng lại khi cần.',
    fields: STATS,
  },
  {
    pageSlug: 'shared', sectionKey: 'stats', sortOrder: 1,
    label: 'Thư viện · Dải số liệu',
    description: 'Stats.tsx — tiêu đề và dải số liệu nổi bật.',
    fields: STATS,
  },
  {
    pageSlug: 'shared', sectionKey: 'markets-map', sortOrder: 2,
    label: 'Thư viện · Bản đồ thị trường',
    description: 'MarketsMap.tsx — bản đồ thế giới tương tác và nút khu vực.',
    fields: REGIONS,
  },
  {
    pageSlug: 'shared', sectionKey: 'products-overview', sortOrder: 3,
    label: 'Thư viện · Giới thiệu sản phẩm',
    description: 'ProductsOverview.tsx — danh sách giống, lưới cỡ hạt và dải ảnh.',
    fields: VARIETIES_OVERVIEW,
  },
  {
    pageSlug: 'shared', sectionKey: 'icon-card-list', sortOrder: 4,
    label: 'Thư viện · Danh sách thẻ icon',
    description: 'IconCardList.tsx — thẻ có icon (tiêu đề + mô tả), icon xoay vòng.',
    fields: [titleTextList('configurations', 'Thẻ')],
  },
  {
    pageSlug: 'shared', sectionKey: 'slider-chain', sortOrder: 5,
    label: 'Thư viện · Slider + chuỗi bước',
    description: 'SliderChain.tsx — slider ảnh tự chạy và chuỗi bước bấm được (nền navy).',
    fields: SLIDES_AND_CHAIN,
  },
  {
    pageSlug: 'shared', sectionKey: 'doc-grid', sortOrder: 6,
    label: 'Thư viện · Lưới checklist + chip',
    description: 'DocGrid.tsx — lưới mục có dấu tick và dải chip.',
    fields: documentsList('Mục', 'Chip'),
  },
  {
    pageSlug: 'shared', sectionKey: 'marquee', sortOrder: 7,
    label: 'Thư viện · Chữ chạy ngang',
    description: 'Marquee.tsx — dòng chữ chạy ngang.',
    fields: AUDIENCES,
  },
  {
    pageSlug: 'shared', sectionKey: 'why-cards', sortOrder: 8,
    label: 'Thư viện · Lưới thẻ lý do',
    description: 'WhyCards.tsx — lưới thẻ icon + tiêu đề + mô tả.',
    fields: [titleTextList('reasons', 'Thẻ lý do')],
  },
  {
    pageSlug: 'shared', sectionKey: 'quote-cta', sortOrder: 9,
    label: 'Thư viện · Form báo giá',
    description: 'QuoteCta.tsx — form báo giá B2B kèm checklist.',
    fields: CHECKLIST,
  },
  {
    pageSlug: 'shared', sectionKey: 'name-cards', sortOrder: 10,
    label: 'Thư viện · Lưới thẻ tên',
    description: 'NameCards.tsx — lưới thẻ tên có icon hạnh nhân (đọc varieties, trống thì formats).',
    fields: [
      { key: 'varieties', label: 'Tên thẻ (varieties)', type: 'stringList' },
      { key: 'formats', label: 'Tên thẻ (formats)', type: 'stringList' },
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'size-grid', sortOrder: 11,
    label: 'Thư viện · Thước cỡ hạt',
    description: 'SizeGrid.tsx — thước đo cỡ hạt.',
    fields: SIZES,
  },
  {
    pageSlug: 'shared', sectionKey: 'checklist', sortOrder: 12,
    label: 'Thư viện · Lưới checklist',
    description: 'Checklist.tsx — lưới checklist đơn giản.',
    fields: CHECKLIST,
  },
  {
    pageSlug: 'shared', sectionKey: 'contact-info', sortOrder: 13,
    label: 'Thư viện · Thẻ thông tin liên hệ',
    description: 'ContactInfo.tsx — địa điểm, địa chỉ, email, điện thoại nhập trực tiếp trong section.',
    fields: [
      {
        key: '__self__', label: 'Thông tin liên hệ', type: 'textMap',
        fields: [
          { name: 'location', label: 'Địa điểm' },
          { name: 'address', label: 'Địa chỉ' },
          { name: 'email', label: 'Email' },
          { name: 'phone', label: 'Điện thoại / WhatsApp' },
        ],
      },
    ],
  },
];

@Injectable()
export class SectionDefinitionSeed {
  constructor(
    @InjectRepository(SectionDefinition)
    private readonly definitionRepo: Repository<SectionDefinition>,
  ) {}

  async run(): Promise<void> {
    let upserted = 0;
    for (const definition of DEFINITIONS) {
      const existing = await this.definitionRepo.findOne({
        where: { sectionKey: definition.sectionKey },
        withDeleted: true,
      });
      if (existing) {
        // Registry do code quản lý → đồng bộ lại toàn bộ mô tả/spec.
        existing.pageSlug = definition.pageSlug;
        existing.label = definition.label;
        existing.description = definition.description;
        existing.fields = definition.fields;
        existing.sortOrder = definition.sortOrder;
        existing.deletedAt = null;
        await this.definitionRepo.save(existing);
      } else {
        await this.definitionRepo.save(this.definitionRepo.create(definition));
      }
      upserted++;
    }
    console.log(`--- [Seed] Section definitions: synced ${upserted} definition(s).`);
  }
}

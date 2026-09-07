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

/**
 * THƯ VIỆN COMPONENT dùng chung — nguồn chân lý do code quản lý. Mỗi component
 * gắn được lên MỌI trang (kể cả trang tự tạo, render qua SectionRenderer);
 * pageSlug chỉ ghi chú trang chuẩn đang dùng nó mặc định. Seed UPSERT (ghi đè label/mô tả/spec mỗi lần chạy)
 * để danh mục luôn khớp code; dữ liệu section của admin không bị đụng tới.
 */
const DEFINITIONS: DefinitionSeed[] = [
  {
    pageSlug: 'home', sectionKey: 'hero', sortOrder: 1,
    label: 'Dải số liệu nổi bật (stats)',
    description: 'Tiêu đề lớn, eyebrow, đoạn giới thiệu và 3 số liệu nổi bật.',
    fields: [
      {
        key: 'stats', label: 'Số liệu nổi bật', type: 'itemList',
        hint: 'Giá trị có số ở đầu sẽ tự chạy hiệu ứng đếm (VD: 30+, 7).',
        itemFields: [
          { name: 'label', label: 'Nhãn', kind: 'text' },
          { name: 'value', label: 'Giá trị', kind: 'text' },
        ],
      },
    ],
  },
  {
    pageSlug: 'home', sectionKey: 'markets', sortOrder: 2,
    label: 'Bản đồ thị trường tương tác',
    description: 'Tiêu đề khối bản đồ thế giới và nhãn 6 nút khu vực.',
    fields: [
      {
        key: 'regions', label: 'Khu vực trên bản đồ', type: 'json',
        hint: 'Cấu trúc [{key,name,countries[]}]. key phải thuộc us/na/ap/sa/me/eu để ghim trên bản đồ sáng đúng khu vực.',
      },
    ],
  },
  {
    pageSlug: 'home', sectionKey: 'products-overview', sortOrder: 3,
    label: 'Giới thiệu sản phẩm (giống + cỡ hạt + dải ảnh)',
    description: 'Danh sách giống, lưới cỡ hạt và dải 3 ảnh ở trang chủ.',
    fields: [
      { key: 'varieties', label: 'Giống hạnh nhân', type: 'stringList' },
      { key: 'sizes', label: 'Cỡ hạt (kernels/oz)', type: 'stringList' },
      {
        key: 'photos', label: 'Dải ảnh', type: 'itemList', hint: IMAGE_HINT,
        itemFields: [
          { name: 'image', label: 'Ảnh', kind: 'image' },
          { name: 'caption', label: 'Chú thích', kind: 'text' },
        ],
      },
    ],
  },
  {
    pageSlug: 'home', sectionKey: 'orders', sortOrder: 4,
    label: 'Danh sách thẻ icon (đóng gói / dịch vụ)',
    description: 'Khối "Built for B2B Supply" với 5 thẻ cấu hình đóng gói.',
    fields: [
      {
        key: 'configurations', label: 'Cấu hình đóng gói', type: 'itemList',
        itemFields: [
          { name: 'title', label: 'Tiêu đề', kind: 'text' },
          { name: 'text', label: 'Mô tả', kind: 'textarea' },
        ],
      },
    ],
  },
  {
    pageSlug: 'home', sectionKey: 'sourcing', sortOrder: 5,
    label: 'Slider ảnh + chuỗi bước',
    description: 'Slider ảnh tự chạy và 6 bước chuỗi cung ứng California.',
    fields: [
      {
        key: 'slides', label: 'Ảnh slider', type: 'itemList', hint: IMAGE_HINT,
        itemFields: [
          { name: 'image', label: 'Ảnh', kind: 'image' },
          { name: 'caption', label: 'Chú thích', kind: 'text' },
        ],
      },
      {
        key: 'chain', label: 'Các bước chuỗi cung ứng', type: 'stringList',
        hint: 'Bước chứa chữ "Prime Nuts" sẽ được tô vàng nổi bật.',
      },
    ],
  },
  {
    pageSlug: 'home', sectionKey: 'logistics', sortOrder: 6,
    label: 'Lưới checklist + chip (chứng từ / incoterm)',
    description: 'Lưới chứng từ hỗ trợ và các Incoterm báo giá.',
    fields: [
      {
        key: 'documents', label: 'Chứng từ hỗ trợ', type: 'itemList',
        hint: 'Ghi chú (nếu có) hiện chữ nghiêng nhỏ cạnh tên chứng từ.',
        itemFields: [
          { name: 'label', label: 'Tên chứng từ', kind: 'text' },
          { name: 'note', label: 'Ghi chú', kind: 'text' },
        ],
      },
      { key: 'incoterms', label: 'Incoterms', type: 'stringList' },
    ],
  },
  {
    pageSlug: 'home', sectionKey: 'who-we-serve', sortOrder: 7,
    label: 'Chữ chạy ngang (marquee)',
    description: 'Dòng chữ chạy ngang (marquee) liệt kê nhóm khách hàng.',
    fields: [
      { key: 'audiences', label: 'Nhóm khách hàng', type: 'stringList' },
    ],
  },
  {
    pageSlug: 'home', sectionKey: 'why-us', sortOrder: 8,
    label: 'Lưới thẻ lý do (icon + tiêu đề + mô tả)',
    description: 'Lưới 6 thẻ lý do (icon giữ cố định theo thiết kế).',
    fields: [
      {
        key: 'reasons', label: 'Thẻ lý do', type: 'itemList',
        itemFields: [
          { name: 'title', label: 'Tiêu đề', kind: 'text' },
          { name: 'text', label: 'Mô tả', kind: 'textarea' },
        ],
      },
    ],
  },
  {
    pageSlug: 'home', sectionKey: 'quote-cta', sortOrder: 9,
    label: 'Form báo giá + checklist',
    description: 'Khối chốt trang chủ với checklist thông tin cần cung cấp.',
    fields: [
      { key: 'checklist', label: 'Checklist báo giá', type: 'stringList' },
    ],
  },
  {
    pageSlug: 'products', sectionKey: 'natural-almonds', sortOrder: 1,
    label: 'Lưới thẻ tên (icon hạnh nhân)',
    description: 'Lưới thẻ giống hạnh nhân tự nhiên ở trang Products.',
    fields: [
      {
        key: 'varieties', label: 'Giống hạnh nhân', type: 'stringList',
        hint: 'Tên trùng bộ mặc định (Nonpareil, Carmel…) sẽ giữ nguyên mô tả + chip có sẵn.',
      },
    ],
  },
  {
    pageSlug: 'products', sectionKey: 'processed-almonds', sortOrder: 2,
    label: 'Lưới thẻ định dạng (icon hạnh nhân)',
    description: 'Lưới thẻ định dạng chế biến ở trang Products.',
    fields: [
      {
        key: 'formats', label: 'Định dạng chế biến', type: 'stringList',
        hint: 'Tên trùng bộ mặc định (Blanched, Sliced…) sẽ giữ nguyên mô tả + chip có sẵn.',
      },
    ],
  },
  {
    pageSlug: 'products', sectionKey: 'kernel-sizes', sortOrder: 3,
    label: 'Lưới cỡ hạt',
    description: 'Lưới cỡ hạt ở trang Products.',
    fields: [
      { key: 'sizes', label: 'Cỡ hạt (kernels/oz)', type: 'stringList' },
    ],
  },
  {
    pageSlug: 'contact', sectionKey: 'contact-info', sortOrder: 1,
    label: 'Thẻ thông tin liên hệ',
    description: 'Địa chỉ, email, điện thoại và giờ làm việc ở trang Contact.',
    fields: [
      {
        key: '__self__', label: 'Thông tin liên hệ', type: 'textMap',
        fields: [
          { name: 'location', label: 'Địa điểm' },
          { name: 'email', label: 'Email' },
          { name: 'phone', label: 'Điện thoại / WhatsApp' },
          { name: 'businessHours', label: 'Giờ làm việc' },
        ],
      },
    ],
  },
  {
    pageSlug: 'contact', sectionKey: 'quotation-checklist', sortOrder: 2,
    label: 'Lưới checklist đơn giản',
    description: 'Lưới các mục nên cung cấp khi yêu cầu báo giá.',
    fields: [
      { key: 'checklist', label: 'Danh sách mục', type: 'stringList' },
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

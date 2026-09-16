import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, In, Repository } from 'typeorm';
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
const ICON_HINT =
  'Icon (tuỳ chọn) — tên trong bộ icon chung: pin, leaf, scale, tune, ship, heart, almond, product, ruler, grade, calendar, box, pallet, building, mail, phone, blanched, sliced, slivered, diced, flour. Trống thì xoay vòng theo thứ tự.';
const CTA_HINT = 'Chữ trên nút để trống thì ẩn nút. Link: #tên-section trên cùng trang (VD #request-quote) hoặc /duong-dan.';

/* ---------- helper dựng spec ---------- */

const layout = (
  options: Array<{ value: string; label: string; hint?: string }>,
): SectionFieldSpec => ({
  key: 'layout',
  label: 'Bố cục',
  type: 'select',
  options,
  hint: 'Đổi bố cục thì dữ liệu bên dưới giữ nguyên — chỉ cách hiển thị thay đổi.',
});

const stringList = (key: string, label: string, hint?: string, layouts?: string[]): SectionFieldSpec => ({
  key, label, type: 'stringList', ...(hint ? { hint } : {}), ...(layouts ? { layouts } : {}),
});

const image = (key: string, label: string, hint?: string, layouts?: string[]): SectionFieldSpec => ({
  key, label, type: 'image', hint: hint ?? IMAGE_HINT, ...(layouts ? { layouts } : {}),
});

const textMap = (
  label: string,
  fields: Array<{ name: string; label: string }>,
  hint?: string,
  layouts?: string[],
): SectionFieldSpec => ({
  key: '__self__', label, type: 'textMap', fields, ...(hint ? { hint } : {}), ...(layouts ? { layouts } : {}),
});

type ItemField = { name: string; label: string; kind: 'text' | 'textarea' | 'image' };
const itemList = (
  key: string,
  label: string,
  itemFields: ItemField[],
  hint?: string,
  layouts?: string[],
): SectionFieldSpec => ({
  key, label, type: 'itemList', itemFields, ...(hint ? { hint } : {}), ...(layouts ? { layouts } : {}),
});

const CTA_FIELDS = [
  { name: 'ctaLabel', label: 'Chữ trên nút' },
  { name: 'ctaHref', label: 'Link của nút' },
];

/**
 * DANH MỤC COMPONENT — nguồn chân lý do code quản lý.
 *
 * Một component = một BỐ CỤC, đặt tên theo hình dạng (hero, marquee, faq…),
 * không theo nội dung. Biến thể hiển thị = field `layout`. Mọi component đều
 * dùng được ở mọi trang (pageSlug `shared`). Danh sách chính của mỗi component
 * là `items`; danh sách phụ giữ tên riêng (stats, slides, sizes, chips, photos).
 *
 * sectionKey = key trong registry frontend
 * (frontend-next/src/app/(site)/_components/sections/index.ts) = tên file component.
 *
 * Seed UPSERT theo sectionKey (ghi đè label/mô tả/spec mỗi lần chạy) và XOÁ HẲN các
 * component không còn trong code; dữ liệu section của admin không bị đụng tới.
 */
const DEFINITIONS: DefinitionSeed[] = [
  {
    pageSlug: 'shared', sectionKey: 'hero', sortOrder: 1,
    label: 'Hero (đầu trang)',
    description: 'Hero.tsx — khối đầu trang. Bố cục "Slider": ảnh nền chuyển slide, chữ đổi theo slide, dãy số bên phải. Bố cục "Tĩnh": tiêu đề lớn + giới thiệu + ảnh tràn mép phải. Cả hai có 2 nút và dải số liệu.',
    fields: [
      layout([
        { value: 'slider', label: 'Slider', hint: 'Ảnh nền chuyển slide, dãy số bên phải' },
        { value: 'static', label: 'Tĩnh', hint: 'Một ảnh tràn mép phải' },
      ]),
      itemList('slides', 'Slide', [
        { name: 'image', label: 'Ảnh nền', kind: 'image' },
        { name: 'title', label: 'Tiêu đề', kind: 'text' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
        { name: 'alt', label: 'Mô tả ảnh (alt)', kind: 'text' },
      ], IMAGE_HINT + ' Tiêu đề / mô tả để trống thì dùng Heading / Nội dung của section. Mô tả: xuống dòng 2 lần để tách đoạn.', ['slider']),
      image('image', 'Ảnh tràn mép phải', undefined, ['static']),
      itemList('stats', 'Số liệu nổi bật', [
        { name: 'label', label: 'Nhãn', kind: 'text' },
        { name: 'value', label: 'Giá trị', kind: 'text' },
      ], 'Giá trị có số ở đầu sẽ tự chạy hiệu ứng đếm (VD: 4+, 6).'),
      textMap('Nút', [
        { name: 'ctaLabel', label: 'Nút 1 — chữ' },
        { name: 'ctaHref', label: 'Nút 1 — link' },
        { name: 'cta2Label', label: 'Nút 2 — chữ' },
        { name: 'cta2Href', label: 'Nút 2 — link' },
      ], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'about-map', sortOrder: 2,
    label: 'Giới thiệu + bản đồ thế giới',
    description: 'AboutMap.tsx — đầu khối + bản đồ. Bố cục "Ghim": bản đồ ghim thị trường với nút khu vực. Bố cục "Danh sách khu vực": danh sách bên trái (bấm xem các nước), bản đồ bên phải sáng đúng khu vực.',
    fields: [
      layout([
        { value: 'pins', label: 'Ghim thị trường' },
        { value: 'regions', label: 'Danh sách khu vực' },
      ]),
      {
        key: 'regions', label: 'Khu vực trên bản đồ', type: 'json',
        hint: 'Cấu trúc [{key,name,countries[]}] — key thuộc us/na/ap/sa/me/eu để ghim sáng đúng khu vực. Để trống dùng 6 khu vực của bản đồ; countries trống thì lấy theo ghim.',
      },
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'media-cards', sortOrder: 3,
    label: 'Lưới thẻ có ảnh',
    description: 'MediaCards.tsx — mỗi thẻ một giống / định dạng sản phẩm. Bố cục: ảnh tròn đánh số · thẻ lớn có công tắc "Short version" · thẻ tên (không ảnh) · ảnh lớn + lưới thẻ ảnh · thẻ ảnh có nhãn số + icon.',
    fields: [
      layout([
        { value: 'circles', label: 'Ảnh tròn đánh số' },
        { value: 'toggle', label: 'Thẻ lớn + công tắc', hint: 'Gradient navy khi thẻ không có ảnh' },
        { value: 'names', label: 'Thẻ tên' },
        { value: 'photo', label: 'Ảnh lớn + lưới thẻ ảnh' },
        { value: 'badge', label: 'Thẻ ảnh có nhãn số' },
      ]),
      itemList('items', 'Thẻ', [
        { name: 'title', label: 'Tên', kind: 'text' },
        { name: 'short', label: 'Mô tả ngắn (bố cục Thẻ lớn)', kind: 'text' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
        { name: 'image', label: 'Ảnh', kind: 'image' },
        { name: 'imagePosition', label: 'Vị trí ảnh (VD: center 60%)', kind: 'text' },
        { name: 'icon', label: 'Icon (bố cục Nhãn số)', kind: 'text' },
      ], IMAGE_HINT + ' ' + ICON_HINT),
      stringList('sizes', 'Cỡ hạt (hiện trong bản đầy đủ của thẻ)', undefined, ['toggle']),
      textMap('Chữ trên thẻ lớn', [
        { name: 'toggleLabel', label: 'Chữ cạnh công tắc (mặc định: Short version)' },
        ...CTA_FIELDS,
        { name: 'note', label: 'Dòng chú thích cuối khối' },
      ], CTA_HINT, ['toggle']),
      image('image', 'Ảnh lớn phía trên lưới', undefined, ['photo']),
      itemList('photos', 'Dải ảnh dưới lưới', [
        { name: 'image', label: 'Ảnh', kind: 'image' },
        { name: 'caption', label: 'Chú thích', kind: 'text' },
      ], IMAGE_HINT, ['badge']),
      textMap('Chữ phụ', [
        { name: 'itemLabel', label: 'Chữ trước số thứ tự (VD: Variety, Format)' },
        { name: 'imageAlt', label: 'Mô tả ảnh lớn (alt)' },
        { name: 'note', label: 'Dòng ghi chú cuối khối (có thể dùng <strong>)' },
      ], undefined, ['photo', 'badge']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'size-scale', sortOrder: 4,
    label: 'Thước cỡ hạt',
    description: 'SizeScale.tsx — panel navy, mỗi cỡ một hạt vàng nhỏ dần. Bố cục "Khối đầy đủ": có đầu khối lớn. Bố cục "Dải gọn": tiêu đề nhỏ (Heading) + thước, ghép liền dưới khối khác.',
    fields: [
      layout([
        { value: 'section', label: 'Khối đầy đủ' },
        { value: 'band', label: 'Dải gọn' },
      ]),
      stringList('items', 'Cỡ hạt (kernels/oz)', 'Xếp từ hạt to tới hạt nhỏ (VD 20/22 … 30/32).'),
      textMap('Chữ trên thước', [
        { name: 'scaleNote', label: 'Chữ vàng trong thước' },
        { name: 'footnote', label: 'Chú thích dưới thước' },
      ]),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'photo-strip', sortOrder: 5,
    label: 'Dải ảnh + ghi chú',
    description: 'PhotoStrip.tsx — dải ảnh khung bo góc có chú thích, dưới là dòng ghi chú + nút. Có Heading thì hiện đầu khối, không thì chỉ có dải ảnh.',
    fields: [
      itemList('items', 'Ảnh', [
        { name: 'image', label: 'Ảnh', kind: 'image' },
        { name: 'caption', label: 'Chú thích', kind: 'text' },
      ], IMAGE_HINT),
      textMap('Ghi chú + nút', [{ name: 'note', label: 'Dòng ghi chú' }, ...CTA_FIELDS], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'icon-card-list', sortOrder: 6,
    label: 'Danh sách dòng có icon',
    description: 'IconCardList.tsx — mỗi dòng một mục có icon (tiêu đề + mô tả). Bố cục "Danh sách": đầu khối + danh sách. Bố cục "Chia đôi": chữ + nút + ảnh lớn bên trái, ảnh blob có nhãn + danh sách bên phải (thông số sản phẩm).',
    fields: [
      layout([
        { value: 'list', label: 'Danh sách' },
        { value: 'split', label: 'Chia đôi có ảnh' },
      ]),
      itemList('items', 'Dòng', [
        { name: 'title', label: 'Tiêu đề', kind: 'text' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
        { name: 'icon', label: 'Icon', kind: 'text' },
      ], ICON_HINT),
      image('image', 'Ảnh lớn bên trái', undefined, ['split']),
      image('image2', 'Ảnh blob bên phải', undefined, ['split']),
      textMap('Chữ và nút (bố cục Chia đôi)', [
        ...CTA_FIELDS,
        { name: 'imageAlt', label: 'Mô tả ảnh lớn (alt)' },
        { name: 'image2Alt', label: 'Mô tả ảnh blob (alt)' },
        { name: 'badge', label: 'Nhãn trên ảnh blob (dùng | để xuống dòng, VD 50 lb|Cartons)' },
      ], CTA_HINT, ['split']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'steps', sortOrder: 7,
    label: 'Các bước quy trình',
    description: 'Steps.tsx — quy trình theo bước. Bố cục "Slider + ô bước": nền navy, slider ảnh tự chạy, bấm ô bước N chuyển tới ảnh N, có nút. Bố cục "Vòng tròn": bước đánh số trong vòng tròn nối bằng đường cong nét đứt, nền kem có bản đồ mờ.',
    fields: [
      layout([
        { value: 'slider', label: 'Slider + ô bước' },
        { value: 'circles', label: 'Vòng tròn nối nhau', hint: 'Nên 3–5 bước để nằm trên một hàng' },
      ]),
      itemList('items', 'Các bước', [
        { name: 'title', label: 'Tên bước', kind: 'text' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
      ]),
      itemList('slides', 'Ảnh slider', [
        { name: 'image', label: 'Ảnh', kind: 'image' },
        { name: 'caption', label: 'Chú thích', kind: 'text' },
        { name: 'alt', label: 'Mô tả ảnh (alt)', kind: 'text' },
      ], IMAGE_HINT + ' Nên để số ảnh bằng số bước (bấm bước N → ảnh N).', ['slider']),
      textMap('Nút', CTA_FIELDS, CTA_HINT, ['slider']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'feature-list', sortOrder: 8,
    label: 'Danh sách mục + chip',
    description: 'FeatureList.tsx — mục có ghi chú nhỏ + dải chip. Bố cục "Kẹp ảnh tròn": mục đánh số hai bên ảnh tròn trung tâm, dưới là câu mục tiêu + chip. Bố cục "Lưới tick": lưới mục có dấu tick + chip.',
    fields: [
      layout([
        { value: 'split', label: 'Kẹp ảnh tròn' },
        { value: 'grid', label: 'Lưới tick' },
      ]),
      itemList('items', 'Mục', [
        { name: 'label', label: 'Tên mục', kind: 'text' },
        { name: 'note', label: 'Ghi chú (chữ nghiêng nhỏ)', kind: 'text' },
      ]),
      stringList('chips', 'Chip (VD Incoterm)', 'Để trống thì ẩn dải chip.'),
      image('image', 'Ảnh tròn trung tâm', undefined, ['split']),
      textMap('Dải chip', [{ name: 'note', label: 'Câu hiện trong dải chip' }]),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'marquee', sortOrder: 9,
    label: 'Chữ chạy ngang',
    description: 'Marquee.tsx — tiêu đề nhỏ (Heading) + chữ chạy ngang; đủ mục thì chia 2 dòng chạy ngược chiều; câu ghi chú lấy từ Nội dung.',
    fields: [stringList('items', 'Các mục chạy', 'Heading = tiêu đề nhỏ phía trên; Nội dung = câu ghi chú phía dưới.')],
  },
  {
    pageSlug: 'shared', sectionKey: 'feature-cards', sortOrder: 10,
    label: 'Lưới thẻ icon',
    description: 'FeatureCards.tsx — lưới thẻ icon + tiêu đề + mô tả trên nền kem (VD lý do chọn chúng tôi).',
    fields: [
      itemList('items', 'Thẻ', [
        { name: 'title', label: 'Tiêu đề', kind: 'text' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
        { name: 'icon', label: 'Icon', kind: 'text' },
      ], ICON_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'faq', sortOrder: 11,
    label: 'FAQ (accordion)',
    description: 'Faq.tsx — câu hỏi bấm mở. Bố cục "2 cột": thẻ trắng viền trái có dấu +, tự chia 2 cột hoặc theo nhóm. Bố cục "Chia đôi có ảnh": accordion 1 cột bên trái, ảnh lớn bo góc bên phải, ghi chú cuối cột.',
    fields: [
      layout([
        { value: 'columns', label: '2 cột' },
        { value: 'split', label: 'Chia đôi có ảnh' },
      ]),
      itemList('items', 'Câu hỏi', [
        { name: 'question', label: 'Câu hỏi', kind: 'text' },
        { name: 'answer', label: 'Câu trả lời', kind: 'textarea' },
        { name: 'group', label: 'Nhóm (tuỳ chọn, bố cục 2 cột)', kind: 'text' },
      ], 'Câu trả lời: xuống dòng 2 lần để tách đoạn. Nhóm: các câu cùng tên nhóm gom thành 1 cột có tiêu đề.'),
      textMap('Tiêu đề (bố cục 2 cột)', [
        { name: 'headingAccent', label: 'Phần tiêu đề tô màu (phải nằm trong Heading)' },
      ], undefined, ['columns']),
      image('image', 'Ảnh lớn ở cột phải', undefined, ['split']),
      textMap('Ghi chú + tuỳ chọn hiển thị (bố cục Chia đôi)', [
        { name: 'note', label: 'Ghi chú cuối cột trái (disclaimer)' },
        { name: 'imageAlt', label: 'Mô tả ảnh (alt)' },
        { name: 'imageSide', label: "Vị trí ảnh — nhập 'left' để đảo ảnh sang trái" },
      ], undefined, ['split']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'quote-form', sortOrder: 12,
    label: 'Form báo giá + checklist',
    description: 'QuoteForm.tsx — nền navy: tiêu đề + checklist "Please include" bên trái, form báo giá B2B (gửi API thật) bên phải.',
    fields: [
      stringList('items', 'Checklist "Please include"'),
      textMap('Dòng cuối', [{ name: 'note', label: 'Dòng ghi chú dưới checklist' }]),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'checklist', sortOrder: 13,
    label: 'Lưới checklist',
    description: 'Checklist.tsx — lưới mục có dấu tick, dưới là dòng ghi chú (có thể chứa link) + nút.',
    fields: [
      stringList('items', 'Các mục'),
      textMap('Ghi chú + nút', [
        { name: 'note', label: 'Dòng ghi chú (được dùng <a href="...">link</a>)' },
        ...CTA_FIELDS,
      ], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'contact', sortOrder: 14,
    label: 'Thông tin liên hệ',
    description: 'Contact.tsx — địa điểm / địa chỉ / email / điện thoại. Bố cục "Có form": cột trái thông tin + ghi chú + ảnh, cột phải form liên hệ. Bố cục "Danh sách": chỉ danh sách thông tin.',
    fields: [
      layout([
        { value: 'form', label: 'Có form liên hệ' },
        { value: 'list', label: 'Chỉ danh sách' },
      ]),
      textMap('Thông tin liên hệ', [
        { name: 'location', label: 'Địa điểm' },
        { name: 'address', label: 'Địa chỉ' },
        { name: 'email', label: 'Email' },
        { name: 'phone', label: 'Điện thoại / WhatsApp' },
      ], 'Để trống ô nào thì lấy từ Admin → Trang Liên hệ (rồi tới cấu hình mặc định).'),
      textMap('Ghi chú', [
        { name: 'note', label: 'Ghi chú dưới danh sách' },
        { name: 'imageAlt', label: 'Mô tả ảnh (alt)' },
      ]),
      image('image', 'Ảnh dưới ghi chú', undefined, ['form']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'stats', sortOrder: 15,
    label: 'Dải số liệu',
    description: 'Stats.tsx — đầu khối + dải số liệu nổi bật (số ở đầu tự chạy đếm).',
    fields: [
      itemList('stats', 'Số liệu nổi bật', [
        { name: 'label', label: 'Nhãn', kind: 'text' },
        { name: 'value', label: 'Giá trị', kind: 'text' },
      ], 'Giá trị có số ở đầu sẽ tự chạy hiệu ứng đếm (VD: 4+, 6).'),
    ],
  },
];

/** Tên component hiện có — dùng để ẩn danh mục cũ và để validate metadata. */
export const SECTION_COMPONENT_KEYS = DEFINITIONS.map((d) => d.sectionKey);

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

    // Component không còn trong code (đã gộp / đổi tên) → xoá hẳn khỏi danh mục.
    // An toàn: bảng này chỉ là khuôn form do code sinh ra, không bảng nào tham
    // chiếu tới; section dùng tên cũ vẫn render nhờ LEGACY_COMPONENTS ở frontend.
    const stale = await this.definitionRepo.find({
      where: { sectionKey: Not(In(SECTION_COMPONENT_KEYS)) },
      withDeleted: true,
    });
    if (stale.length > 0) await this.definitionRepo.remove(stale);

    console.log(
      `--- [Seed] Section definitions: synced ${upserted} definition(s)` +
        (stale.length > 0 ? `, removed ${stale.length} old one(s).` : '.'),
    );
  }
}

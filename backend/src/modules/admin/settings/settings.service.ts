import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from './site-setting.entity';

const ALLOWED_KEYS = new Set([
  'siteTitle',
  'siteDescription',
  'brandName', // chữ hiển thị cạnh logo (mặc định "Prime Nuts USA")
  'footerText', // dòng chữ cuối trang (sau "© <năm> ")
  'faviconUrl',
  'logoUrl',
  'logoHeight',
  'footerLogoUrl', // logo riêng cho footer (nền xanh đậm) — trống dùng logo chính
  'footerLogoHeight',
  'heroImageUrl',
  'ogImageUrl', // ảnh đại diện khi chia sẻ link (og:image) — trống thì dùng ảnh bìa
  'fontFamily',
  'colorsDark',
  'colorsLight',
  'translateEnabled',
  'copyProtection',
  'showPostMeta', // hiện ngày đăng + số phút đọc trên bài viết (false = ẩn toàn site)
  'translations', // { vi: { siteTitle, siteDescription } } — merge khi ?lang=vi
  'socialLinks', // { facebook, youtube, instagram, linkedin } — khung social trang Contact
  'contactPage', // cấu hình trang Contact (hero, thông tin công ty, form)
  'contactInfo', // { location, address, email, phone } hiển thị trên website
  // Key kế thừa từ admin UI cũ — site Prime Nuts chưa dùng, giữ để form settings không lỗi.
  'postTitleSize',
]);

/**
 * Giá trị mặc định do code sở hữu — trả về khi DB chưa có key (admin mở Cài đặt
 * là thấy sẵn). Đường dẫn /images/... là file tĩnh của frontend-next/public,
 * ảnh admin chọn từ Thư viện sẽ là /uploads/... và ghi đè các giá trị này.
 */
const DEFAULT_SETTINGS: Record<string, unknown> = {
  logoUrl: '/images/logo-primenut-main.png',
  logoHeight: 42,
  footerLogoUrl: '/images/logo-primenut-footer.png',
  footerLogoHeight: 44,
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingsRepo: Repository<SiteSetting>,
  ) {}

  async getAll(): Promise<Record<string, unknown>> {
    const rows = await this.settingsRepo.find();
    const map: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const row of rows) map[row.key] = row.value;
    return map;
  }

  async updateMany(
    values: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      throw new BadRequestException('Settings payload must be an object');
    }

    for (const [key, value] of Object.entries(values)) {
      if (!ALLOWED_KEYS.has(key)) {
        throw new BadRequestException(`Unknown setting key: ${key}`);
      }

      if (value === null) {
        await this.settingsRepo.delete({ key });
        continue;
      }

      const existing = await this.settingsRepo.findOne({ where: { key } });
      if (existing) {
        existing.value = value;
        await this.settingsRepo.save(existing);
      } else {
        await this.settingsRepo.save(this.settingsRepo.create({ key, value }));
      }
    }

    return this.getAll();
  }
}

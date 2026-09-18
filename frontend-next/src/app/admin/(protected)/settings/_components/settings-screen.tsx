'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RotateCcw, X } from 'lucide-react';
import { LibraryPicker } from '@/app/admin/_components/library-picker/library-picker';
import { getErrorMessage, resolveImageUrl } from '@/app/admin/_lib/utils';
import {
  settingsService,
  SETTINGS_QUERY_KEY,
  FONT_OPTIONS,
  POST_TITLE_DEFAULT,
  POST_TITLE_MAX,
  POST_TITLE_MIN,
} from '@/app/admin/(protected)/settings/_lib/settings.service';
import Link from 'next/link';
import { pageService, PAGE_QUERY_KEY } from '@/app/admin/(protected)/pages/_lib/page.service';
import { SITE_CONTACT } from '@/config/contact';
import { adminRoutes } from '@/config/routes';
import type { ContactPageConfig } from '@/lib/contact-page';
import {
  BRAND_COLOR_DEFAULTS,
  BRAND_COLOR_FIELDS,
  BRAND_SHADES,
  isBrandHex,
  type BrandColorKey,
  type BrandColors,
} from '@/lib/brand-colors';

type PickerTarget = 'logo' | 'footerLogo' | 'favicon' | 'hero' | 'og' | null;

/** Ô thông tin liên hệ — khớp contactPage.company (lib/contact-page.ts). */
const COMPANY_FIELDS = [
  { key: 'name', label: 'Tên công ty', placeholder: 'Tên công ty của bạn' },
  { key: 'phone', label: 'Điện thoại', placeholder: SITE_CONTACT.phone, type: 'tel' },
  { key: 'email', label: 'Email', placeholder: SITE_CONTACT.email, type: 'email' },
  { key: 'hours', label: 'Giờ mở cửa', placeholder: SITE_CONTACT.hours },
  { key: 'address', label: 'Địa chỉ', placeholder: SITE_CONTACT.address },
  { key: 'location', label: 'Quốc gia / khu vực', placeholder: SITE_CONTACT.location },
  { key: 'mapUrl', label: 'Link Google Maps (tuỳ chọn)', placeholder: 'https://maps.app.goo.gl/...', type: 'url' },
] as const;

type CompanyField = (typeof COMPANY_FIELDS)[number]['key'];

const EMPTY_COMPANY = Object.fromEntries(COMPANY_FIELDS.map((f) => [f.key, ''])) as Record<
  CompanyField,
  string
>;

export function SettingsScreen() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [brandName, setBrandName] = useState('');
  const [footerText, setFooterText] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoHeight, setLogoHeight] = useState(42);
  const [footerLogoUrl, setFooterLogoUrl] = useState('');
  const [footerLogoHeight, setFooterLogoHeight] = useState(44);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [fontFamily, setFontFamily] = useState('');
  const [postTitleSize, setPostTitleSize] = useState(POST_TITLE_DEFAULT);
  const [brandColors, setBrandColors] = useState<BrandColors>({});
  const [zhSiteTitle, setZhSiteTitle] = useState('');
  const [zhSiteDescription, setZhSiteDescription] = useState('');
  const [zhBrandName, setZhBrandName] = useState('');
  const [zhFooterText, setZhFooterText] = useState('');
  const [copyProtection, setCopyProtection] = useState(true);
  const [showPostMeta, setShowPostMeta] = useState(true);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  // Thông tin liên hệ nằm trong JSON contactPage.company — cùng dữ liệu với Admin → Trang Liên hệ.
  const [company, setCompany] = useState<Record<CompanyField, string>>(EMPTY_COMPANY);

  const { data, isLoading } = useQuery({
    queryKey: [...SETTINGS_QUERY_KEY],
    queryFn: () => settingsService.get(),
  });

  // Tiêu đề website áp cho TRANG CHỦ; nếu trang chủ có "Tiêu đề SEO" riêng thì ô này vô hiệu.
  const { data: pages } = useQuery({
    queryKey: [...PAGE_QUERY_KEY, 'meta-title'],
    queryFn: () => pageService.paginate({ limit: 100 }),
  });
  const homePage = (pages?.data ?? []).find((page) => page.slug === 'home');
  const homeTitleOverride = homePage?.metaTitle?.trim() ? homePage : null;

  useEffect(() => {
    if (!data) return;
    setSiteTitle(data.siteTitle ?? '');
    setSiteDescription(data.siteDescription ?? '');
    setBrandName(data.brandName ?? '');
    setFooterText(data.footerText ?? '');
    setFaviconUrl(data.faviconUrl ?? '');
    setLogoUrl(data.logoUrl ?? '');
    setLogoHeight(data.logoHeight ?? 42);
    setFooterLogoUrl(data.footerLogoUrl ?? '');
    setFooterLogoHeight(data.footerLogoHeight ?? 44);
    setHeroImageUrl(data.heroImageUrl ?? '');
    setOgImageUrl(data.ogImageUrl ?? '');
    setFontFamily(data.fontFamily ?? '');
    setPostTitleSize(
      typeof data.postTitleSize === 'number' ? data.postTitleSize : POST_TITLE_DEFAULT,
    );
    setBrandColors(data.brandColors ?? {});
    setZhSiteTitle(data.translations?.vi?.siteTitle ?? '');
    setZhSiteDescription(data.translations?.vi?.siteDescription ?? '');
    setZhBrandName(data.translations?.vi?.brandName ?? '');
    setZhFooterText(data.translations?.vi?.footerText ?? '');
    setCopyProtection(data.copyProtection !== false);
    setShowPostMeta(data.showPostMeta !== false);
    setSocialLinks({
      facebook: data.socialLinks?.facebook ?? '',
      youtube: data.socialLinks?.youtube ?? '',
      instagram: data.socialLinks?.instagram ?? '',
      tiktok: data.socialLinks?.tiktok ?? '',
    });
    const saved = data.contactPage?.company ?? {};
    setCompany(
      Object.fromEntries(
        COMPANY_FIELDS.map((field) => [field.key, saved[field.key] ?? '']),
      ) as Record<CompanyField, string>,
    );
  }, [data]);

  /** Màu admin đang chọn, chưa chọn / không hợp lệ thì là màu mặc định. */
  const brandColorOf = (key: BrandColorKey) => {
    const value = brandColors[key];
    return isBrandHex(value) ? value.toUpperCase() : BRAND_COLOR_DEFAULTS[key];
  };

  function setBrandColor(key: BrandColorKey, value: string) {
    setBrandColors((prev) => ({ ...prev, [key]: value.toUpperCase() }));
  }

  function clearBrandColor(key: BrandColorKey) {
    setBrandColors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        siteTitle: siteTitle.trim() || null,
        siteDescription: siteDescription.trim() || null,
        brandName: brandName.trim() || null,
        footerText: footerText.trim() || null,
        faviconUrl: faviconUrl || null,
        logoUrl: logoUrl || null,
        logoHeight: logoUrl ? logoHeight : null,
        footerLogoUrl: footerLogoUrl || null,
        footerLogoHeight: footerLogoUrl ? footerLogoHeight : null,
        heroImageUrl: heroImageUrl || null,
        ogImageUrl: ogImageUrl || null,
        fontFamily: fontFamily || null,
        // Bằng mặc định thì xóa key (null) — DB chỉ giữ giá trị admin thực sự đổi
        postTitleSize: postTitleSize !== POST_TITLE_DEFAULT ? postTitleSize : null,
        // Chỉ lưu màu khác mặc định — DB gọn, đổi mặc định trong code vẫn ăn.
        brandColors: (() => {
          const changed = Object.fromEntries(
            BRAND_COLOR_FIELDS.map((field) => [field.key, brandColorOf(field.key)]).filter(
              ([key, value]) => value !== BRAND_COLOR_DEFAULTS[key as BrandColorKey],
            ),
          );
          return Object.keys(changed).length ? changed : null;
        })(),
        // Màu theme cũ (tối/sáng) không còn dùng — xoá khỏi DB.
        colorsDark: null,
        colorsLight: null,
        // Thông tin liên hệ gộp vào JSON contactPage: giữ nguyên tiêu đề trang, form,
        // nhu cầu quan tâm và bản dịch do Admin → Trang Liên hệ quản lý.
        contactPage: (() => {
          const next: ContactPageConfig = { ...(data?.contactPage ?? {}) };
          const nextCompany = { ...(next.company ?? {}) };
          for (const field of COMPANY_FIELDS) {
            const value = company[field.key].trim();
            if (value) nextCompany[field.key] = value;
            else delete nextCompany[field.key];
          }
          if (Object.keys(nextCompany).length) next.company = nextCompany;
          else delete next.company;
          return Object.keys(next).length ? next : null;
        })(),
        copyProtection,
        showPostMeta,
        socialLinks: (() => {
          const cleaned = Object.fromEntries(
            Object.entries(socialLinks)
              .map(([k, v]) => [k, v.trim()])
              .filter(([, v]) => v),
          );
          return Object.keys(cleaned).length ? cleaned : null;
        })(),
        translations:
          zhSiteTitle.trim() ||
          zhSiteDescription.trim() ||
          zhBrandName.trim() ||
          zhFooterText.trim()
            ? {
                vi: {
                  ...(zhSiteTitle.trim() ? { siteTitle: zhSiteTitle.trim() } : {}),
                  ...(zhSiteDescription.trim()
                    ? { siteDescription: zhSiteDescription.trim() }
                    : {}),
                  ...(zhBrandName.trim() ? { brandName: zhBrandName.trim() } : {}),
                  ...(zhFooterText.trim() ? { footerText: zhFooterText.trim() } : {}),
                },
              }
            : null,
      };
      await settingsService.update(payload);
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      toast.success('Đã lưu cài đặt — website public sẽ cập nhật ngay');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <p className="dt-empty">Đang tải cài đặt…</p>;
  }

  const logoPreview = resolveImageUrl(logoUrl);
  const footerLogoPreview = resolveImageUrl(footerLogoUrl);
  const faviconPreview = resolveImageUrl(faviconUrl);
  const heroPreview = resolveImageUrl(heroImageUrl);
  const ogPreview = resolveImageUrl(ogImageUrl);

  return (
    <div className="st-screen">
      <div className="adm-page-header is-row">
        <div>
          <h1 className="adm-page-title">Cài đặt website</h1>
          <p className="adm-page-subtitle">Thương hiệu · Hình ảnh · Font chữ · Màu thương hiệu · Liên hệ · Tính năng</p>
        </div>
        <button
          type="button"
          className="adm-btn adm-btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <span className="adm-spin" />}
          Lưu cài đặt
        </button>
      </div>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Thương hiệu &amp; SEO</h2>
        <div>
          <label className="gf-label">Tiêu đề website (title)</label>
          <input
            className="gf-control"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            placeholder="Your Company — Your Tagline"
          />
          <p className="gf-hint">
            Hiện trên tab trình duyệt và kết quả Google cho trang chủ; các trang khác lấy tiêu đề
            riêng rồi thêm đuôi &ldquo;— {brandName.trim() || 'Your Company'}&rdquo;. Để trống dùng mặc định.
          </p>
          {homeTitleOverride && (
            <p className="gf-hint st-soon">
              ⚠ Trang chủ đang đặt tiêu đề SEO riêng (&ldquo;{homeTitleOverride.metaTitle}&rdquo;) nên
              ô này chưa hiện ra ngoài.{' '}
              <Link href={adminRoutes.pages.edit(homeTitleOverride.id)}>
                Mở trang chủ trong mục Trang
              </Link>{' '}
              rồi xoá trống ô &ldquo;Tiêu đề SEO&rdquo; là xong.
            </p>
          )}
        </div>
        <div>
          <label className="gf-label">Mô tả website (description)</label>
          <textarea
            className="gf-control"
            rows={2}
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            placeholder="Short description of your products and services…"
          />
          <p className="gf-hint">Thẻ meta description cho SEO, nên 120–160 ký tự.</p>
        </div>
        <div>
          <label className="gf-label">Tên logo (góc trên bên trái)</label>
          <input
            className="gf-control"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Your Company"
          />
          <p className="gf-hint">
            Chữ hiển thị cạnh logo ở góc trên bên trái mọi trang. Để trống dùng mặc định của theme.
          </p>
        </div>
        <div>
          <label className="gf-label">Dòng chữ cuối trang (footer)</label>
          <input
            className="gf-control"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="Your Company. All rights reserved."
          />
          <p className="gf-hint">
            Phần chữ sau &ldquo;© {new Date().getFullYear()}&rdquo; ở cuối mọi trang (năm tự cập nhật, không cần
            nhập). Để trống dùng mặc định của theme.
          </p>
        </div>
        <details className="gf-group" open={false}>
          <summary className="gf-group-summary">
            <strong>Bản dịch tiếng Việt</strong>
            <small>Để trống mục nào thì website dùng bản tiếng Anh của mục đó.</small>
          </summary>
          <div className="gf-group-body">
            <div>
              <label className="gf-label">Tên website (Tiếng Việt)</label>
              <input
                className="gf-control"
                value={zhSiteTitle}
                onChange={(e) => setZhSiteTitle(e.target.value)}
                placeholder="Tên công ty — Mô tả ngắn"
              />
            </div>
            <div>
              <label className="gf-label">Mô tả website (Tiếng Việt)</label>
              <textarea
                className="gf-control"
                rows={2}
                value={zhSiteDescription}
                onChange={(e) => setZhSiteDescription(e.target.value)}
                placeholder="Mô tả ngắn về sản phẩm và dịch vụ của công ty…"
              />
            </div>
            <div>
              <label className="gf-label">Tên logo (Tiếng Việt)</label>
              <input
                className="gf-control"
                value={zhBrandName}
                onChange={(e) => setZhBrandName(e.target.value)}
                placeholder="Tên công ty"
              />
            </div>
            <div>
              <label className="gf-label">Dòng chữ cuối trang (Tiếng Việt)</label>
              <input
                className="gf-control"
                value={zhFooterText}
                onChange={(e) => setZhFooterText(e.target.value)}
                placeholder="Tên công ty. Bảo lưu mọi quyền."
              />
            </div>
          </div>
        </details>
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Hình ảnh &amp; Logo</h2>
        <div className="st-media-row">
          <div className="st-media">
            <label className="gf-label">Logo website</label>
            <div className="st-media-preview">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo" style={{ height: logoHeight }} />
              ) : (
                <span className="st-media-empty">Đang dùng logo mặc định của theme</span>
              )}
            </div>
            <div className="st-media-actions">
              <button type="button" className="adm-btn" onClick={() => setPickerTarget('logo')}>
                Chọn từ Thư viện
              </button>
              {logoUrl && (
                <button type="button" className="adm-btn" onClick={() => setLogoUrl('')}>
                  <RotateCcw size={14} /> Về logo mặc định
                </button>
              )}
            </div>
            {logoUrl && (
              <div className="st-logo-size">
                <label className="gf-label">Chiều cao logo: {logoHeight}px</label>
                <input
                  type="range"
                  min={20}
                  max={140}
                  value={logoHeight}
                  onChange={(e) => setLogoHeight(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="st-media">
            <label className="gf-label">Favicon (ảnh đại diện tab)</label>
            <div className="st-media-preview is-square">
              {faviconPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={faviconPreview} alt="Favicon" style={{ height: 48, width: 48 }} />
              ) : (
                <span className="st-media-empty">Chưa đặt</span>
              )}
            </div>
            <div className="st-media-actions">
              <button type="button" className="adm-btn" onClick={() => setPickerTarget('favicon')}>
                Chọn từ Thư viện
              </button>
              {faviconUrl && (
                <button type="button" className="adm-btn" onClick={() => setFaviconUrl('')}>
                  <X size={14} /> Bỏ favicon
                </button>
              )}
            </div>
            <p className="gf-hint">Nên dùng ảnh vuông (PNG), tối thiểu 64×64px.</p>
          </div>
        </div>

        <div className="st-media-row">
          <div className="st-media">
            <label className="gf-label">Logo footer (nền xanh đậm)</label>
            <div className="st-media-preview st-media-preview-dark">
              {footerLogoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={footerLogoPreview} alt="Logo footer" style={{ height: footerLogoHeight }} />
              ) : (
                <span className="st-media-empty">Trống — footer dùng chung logo website</span>
              )}
            </div>
            <div className="st-media-actions">
              <button type="button" className="adm-btn" onClick={() => setPickerTarget('footerLogo')}>
                Chọn từ Thư viện
              </button>
              {footerLogoUrl && (
                <button type="button" className="adm-btn" onClick={() => setFooterLogoUrl('')}>
                  <RotateCcw size={14} /> Về logo mặc định
                </button>
              )}
            </div>
            {footerLogoUrl && (
              <div className="st-logo-size">
                <label className="gf-label">Chiều cao logo footer: {footerLogoHeight}px</label>
                <input
                  type="range"
                  min={20}
                  max={140}
                  value={footerLogoHeight}
                  onChange={(e) => setFooterLogoHeight(Number(e.target.value))}
                />
              </div>
            )}
            <p className="gf-hint">Nên dùng bản logo màu sáng (PNG trong suốt) để nổi trên nền xanh của footer.</p>
          </div>
        </div>
        <h3 className="st-subsection-title">Ảnh bìa trang chủ</h3>
        <div className="st-hero-preview">
          {heroPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroPreview} alt="Ảnh bìa" />
          ) : (
            <span className="st-media-empty">
              Chưa đặt — giao diện đang dùng bộ ảnh cố định của thiết kế
            </span>
          )}
        </div>
        <div className="st-media-actions">
          <button type="button" className="adm-btn" onClick={() => setPickerTarget('hero')}>
            Chọn từ Thư viện
          </button>
          {heroImageUrl && (
            <button type="button" className="adm-btn" onClick={() => setHeroImageUrl('')}>
              <X size={14} /> Về ảnh mặc định
            </button>
          )}
        </div>
        <p className="gf-hint">
          ⏳ Chưa nối với giao diện hiện tại. Nên dùng ảnh ngang tối thiểu 1920×1080 (ảnh lớn hơn sẽ tự nén về ~1MB).
        </p>
        <h3 className="st-subsection-title">Ảnh chia sẻ mạng xã hội (og:image)</h3>
        <div className="st-hero-preview">
          {ogPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ogPreview} alt="Ảnh chia sẻ" />
          ) : (
            <span className="st-media-empty">
              Chưa đặt — đang dùng Ảnh bìa trang chủ khi chia sẻ link
            </span>
          )}
        </div>
        <div className="st-media-actions">
          <button type="button" className="adm-btn" onClick={() => setPickerTarget('og')}>
            Chọn từ Thư viện
          </button>
          {ogImageUrl && (
            <button type="button" className="adm-btn" onClick={() => setOgImageUrl('')}>
              <X size={14} /> Bỏ ảnh
            </button>
          )}
        </div>
        <p className="gf-hint">
          Ảnh đại diện hiện ra khi dán link website lên Facebook, Zalo, Messenger… (thẻ og:image).
          Nên dùng ảnh ngang 1200×630 có logo/tên công ty. Từng trang/bài viết có thể đặt ảnh
          riêng trong ô &ldquo;SEO · Ảnh chia sẻ&rdquo; của trang/bài đó.
        </p>
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Font chữ</h2>
        <div>
          <label className="gf-label">Font nội dung website</label>
          <select
            className="gf-control"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            {FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="gf-hint">
            Website mặc định dùng Roboto (Google Fonts); chọn font khác sẽ áp cho toàn bộ chữ
            ngoài site public. Dashboard quản trị giữ font riêng, không bị ảnh hưởng.
          </p>
        </div>

        <div className="st-title-size">
          <label className="gf-label">
            Cỡ chữ tiêu đề bài viết: {postTitleSize}px
            {postTitleSize !== POST_TITLE_DEFAULT && (
              <button
                type="button"
                className="st-color-reset"
                onClick={() => setPostTitleSize(POST_TITLE_DEFAULT)}
                title={`Trả về mặc định (${POST_TITLE_DEFAULT}px)`}
              >
                <RotateCcw size={13} />
              </button>
            )}
          </label>
          <div className="st-title-size-row">
            <input
              type="range"
              min={POST_TITLE_MIN}
              max={POST_TITLE_MAX}
              step={1}
              value={postTitleSize}
              onChange={(e) => setPostTitleSize(Number(e.target.value))}
            />
            <input
              type="number"
              className="gf-control"
              min={POST_TITLE_MIN}
              max={POST_TITLE_MAX}
              value={postTitleSize}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isFinite(next)) return;
                setPostTitleSize(Math.min(POST_TITLE_MAX, Math.max(POST_TITLE_MIN, Math.round(next))));
              }}
            />
          </div>
          <div className="st-title-preview" aria-hidden="true">
            <span style={{ fontSize: postTitleSize }}>Tiêu đề bài viết mẫu hiển thị ở cỡ chữ này</span>
          </div>
          <p className="gf-hint">
            Áp cho tiêu đề (H1) trang chi tiết bài viết trong mục News. Đây là cỡ lớn nhất
            trên desktop; màn hình nhỏ tự co lại nên không cần chỉnh riêng cho mobile.
            Mặc định {POST_TITLE_DEFAULT}px.
          </p>
        </div>
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Màu thương hiệu</h2>
        <p className="gf-hint">
          4 màu gốc của website. Các sắc đậm/nhạt (nền tối, viền, chữ phụ…) tự suy ra từ đây nên
          chỉ cần đổi 4 ô này. Bấm ↺ để trả một màu về mặc định.
        </p>
        <div
          className="st-brand"
          style={
            Object.fromEntries(
              BRAND_COLOR_FIELDS.map((field) => [`--brand-${field.key}`, brandColorOf(field.key)]),
            ) as CSSProperties
          }
        >
          <div className="st-color-group">
            {BRAND_COLOR_FIELDS.map((field) => {
              const current = brandColorOf(field.key);
              const isChanged = current !== field.defaultValue;
              return (
                <div key={field.key} className="st-color-row">
                  <span className="st-color-label">
                    {field.label}
                    {isChanged && <em> (đã đổi)</em>}
                    <small>{field.hint}</small>
                  </span>
                  <div className="st-color-controls">
                    <input
                      type="color"
                      value={current.toLowerCase()}
                      onChange={(e) => setBrandColor(field.key, e.target.value)}
                      aria-label={field.label}
                    />
                    <code>{current}</code>
                    {/* Chưa đổi vẫn giữ chỗ nút ↺ để mã màu các hàng thẳng cột. */}
                    <button
                      type="button"
                      className="st-color-reset"
                      onClick={() => clearBrandColor(field.key)}
                      title={`Trả về màu mặc định (${field.defaultValue})`}
                      style={isChanged ? undefined : { visibility: 'hidden' }}
                      tabIndex={isChanged ? undefined : -1}
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="st-brand-preview" aria-hidden="true">
            <div className="st-brand-mock">
              <span className="st-brand-mock-bar">Tên công ty · Hotline · Email</span>
              <div className="st-brand-mock-hero">
                <strong>Tiêu đề lớn</strong>
                <span>Dòng mô tả ngắn dưới tiêu đề.</span>
                <em>Nút kêu gọi hành động</em>
              </div>
              <div className="st-brand-mock-card">
                <strong>Tên sản phẩm</strong>
                <span>Thông số · Phân loại · Quy cách</span>
              </div>
            </div>
            <ul className="st-brand-shades">
              {BRAND_SHADES.map((shade) => (
                <li key={shade.label}>
                  <i style={{ background: shade.css }} />
                  {shade.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Mạng xã hội</h2>
        <p className="gf-hint" style={{ marginTop: -6 }}>
          Hiện thành biểu tượng ở thanh trên cùng và trong menu mobile. Để trống mạng nào thì ẩn
          mạng đó.
        </p>
        {(
          [
            ['facebook', 'Facebook', 'https://facebook.com/ten-trang'],
            ['youtube', 'YouTube', 'https://youtube.com/@kenh'],
            ['instagram', 'Instagram', 'https://instagram.com/tai-khoan'],
            ['tiktok', 'TikTok', 'https://tiktok.com/@tai-khoan'],
          ] as const
        ).map(([key, label, placeholder]) => (
          <div key={key}>
            <label className="gf-label">{label}</label>
            <input
              className="gf-control"
              value={socialLinks[key] ?? ''}
              onChange={(e) => setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              inputMode="url"
            />
          </div>
        ))}
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Thông tin liên hệ</h2>
        <p className="gf-hint" style={{ marginTop: -6 }}>
          Hiện ở thanh trên cùng, chân trang và trang Liên hệ. Để trống ô nào thì website dùng
          giá trị mặc định (chữ mờ trong ô). Đây cũng chính là thông tin ở Admin → Trang Liên hệ,
          sửa bên nào cũng được.
        </p>
        {COMPANY_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="gf-label">{field.label}</label>
            <input
              className="gf-control"
              type={'type' in field ? field.type : 'text'}
              value={company[field.key]}
              placeholder={field.placeholder}
              onChange={(e) => setCompany((prev) => ({ ...prev, [field.key]: e.target.value }))}
            />
          </div>
        ))}
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Tính năng website</h2>
        <label className="gf-check st-feature">
          <input
            type="checkbox"
            checked={showPostMeta}
            onChange={(e) => setShowPostMeta(e.target.checked)}
          />
          <span>
            <strong>Hiện ngày đăng &amp; số phút đọc trên bài viết</strong>
            <small>Ngày đăng và dòng &ldquo;2 min read&rdquo; ở trang News (bài nổi bật, thẻ bài viết) và đầu trang chi tiết bài. Tắt để ẩn trên toàn website.</small>
          </span>
        </label>
        <label className="gf-check st-feature">
          <input
            type="checkbox"
            checked={copyProtection}
            onChange={(e) => setCopyProtection(e.target.checked)}
          />
          <span>
            <strong>Hạn chế sao chép nội dung</strong>
            <small>Chặn chuột phải, bôi đen, Ctrl+C và kéo ảnh trên website (ô nhập của form báo giá vẫn gõ/dán bình thường). Là rào mềm phía trình duyệt, không chặn tuyệt đối được người dùng kỹ thuật.</small>
          </span>
        </label>
      </section>

      <div className="st-savebar">
        <button
          type="button"
          className="adm-btn adm-btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <span className="adm-spin" />}
          Lưu cài đặt
        </button>
      </div>

      <LibraryPicker
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={(url) => {
          if (pickerTarget === 'logo') setLogoUrl(url);
          if (pickerTarget === 'footerLogo') setFooterLogoUrl(url);
          if (pickerTarget === 'favicon') setFaviconUrl(url);
          if (pickerTarget === 'hero') setHeroImageUrl(url);
          if (pickerTarget === 'og') setOgImageUrl(url);
        }}
      />
    </div>
  );
}

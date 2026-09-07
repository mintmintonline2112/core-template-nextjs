'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RotateCcw, X } from 'lucide-react';
import { LibraryPicker } from '@/admin/features/library/library-picker';
import { getErrorMessage, resolveImageUrl } from '@/admin/lib/utils';
import {
  settingsService,
  SETTINGS_QUERY_KEY,
  COLOR_TOKENS,
  FONT_OPTIONS,
  POST_TITLE_DEFAULT,
  POST_TITLE_MAX,
  POST_TITLE_MIN,
  type ThemeColorOverrides,
} from './settings.service';

type PickerTarget = 'logo' | 'favicon' | 'hero' | 'og' | null;

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
  const [logoHeight, setLogoHeight] = useState(34);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [fontFamily, setFontFamily] = useState('');
  const [postTitleSize, setPostTitleSize] = useState(POST_TITLE_DEFAULT);
  const [colorsDark, setColorsDark] = useState<ThemeColorOverrides>({});
  const [colorsLight, setColorsLight] = useState<ThemeColorOverrides>({});
  const [zhSiteTitle, setZhSiteTitle] = useState('');
  const [zhSiteDescription, setZhSiteDescription] = useState('');
  const [zhBrandName, setZhBrandName] = useState('');
  const [zhFooterText, setZhFooterText] = useState('');
  const [copyProtection, setCopyProtection] = useState(true);
  const [showPostMeta, setShowPostMeta] = useState(true);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: [...SETTINGS_QUERY_KEY],
    queryFn: () => settingsService.get(),
  });

  useEffect(() => {
    if (!data) return;
    setSiteTitle(data.siteTitle ?? '');
    setSiteDescription(data.siteDescription ?? '');
    setBrandName(data.brandName ?? '');
    setFooterText(data.footerText ?? '');
    setFaviconUrl(data.faviconUrl ?? '');
    setLogoUrl(data.logoUrl ?? '');
    setLogoHeight(data.logoHeight ?? 34);
    setHeroImageUrl(data.heroImageUrl ?? '');
    setOgImageUrl(data.ogImageUrl ?? '');
    setFontFamily(data.fontFamily ?? '');
    setPostTitleSize(
      typeof data.postTitleSize === 'number' ? data.postTitleSize : POST_TITLE_DEFAULT,
    );
    setColorsDark(data.colorsDark ?? {});
    setColorsLight(data.colorsLight ?? {});
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
  }, [data]);

  function setColor(theme: 'dark' | 'light', key: string, value: string) {
    const setter = theme === 'dark' ? setColorsDark : setColorsLight;
    setter((prev) => ({ ...prev, [key]: value }));
  }

  function clearColor(theme: 'dark' | 'light', key: string) {
    const setter = theme === 'dark' ? setColorsDark : setColorsLight;
    setter((prev) => {
      const next = { ...prev };
      delete next[key as keyof ThemeColorOverrides];
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
        heroImageUrl: heroImageUrl || null,
        ogImageUrl: ogImageUrl || null,
        fontFamily: fontFamily || null,
        // Bằng mặc định thì xóa key (null) — DB chỉ giữ giá trị admin thực sự đổi
        postTitleSize: postTitleSize !== POST_TITLE_DEFAULT ? postTitleSize : null,
        colorsDark: Object.keys(colorsDark).length ? colorsDark : null,
        colorsLight: Object.keys(colorsLight).length ? colorsLight : null,
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
  const faviconPreview = resolveImageUrl(faviconUrl);
  const heroPreview = resolveImageUrl(heroImageUrl);
  const ogPreview = resolveImageUrl(ogImageUrl);

  return (
    <div className="st-screen">
      <div className="adm-page-header is-row">
        <div>
          <h1 className="adm-page-title">Cài đặt website</h1>
          <p className="adm-page-subtitle">Thương hiệu · Hình ảnh · Font chữ · Màu sắc · Tính năng</p>
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
            placeholder="Prime Nuts USA — California Almonds"
          />
          <p className="gf-hint">Hiển thị trên tab trình duyệt và kết quả Google. Để trống dùng mặc định.</p>
        </div>
        <div>
          <label className="gf-label">Mô tả website (description)</label>
          <textarea
            className="gf-control"
            rows={2}
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            placeholder="Reliable California almond supply for U.S. & global markets…"
          />
          <p className="gf-hint">Thẻ meta description cho SEO, nên 120–160 ký tự.</p>
        </div>
        <div>
          <label className="gf-label">Tên logo (góc trên bên trái)</label>
          <input
            className="gf-control"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Prime Nuts USA"
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
            placeholder="California Almonds. Global Markets. Reliable Supply."
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
                placeholder="Prime Nuts USA — Hạnh nhân California"
              />
            </div>
            <div>
              <label className="gf-label">Mô tả website (Tiếng Việt)</label>
              <textarea
                className="gf-control"
                rows={2}
                value={zhSiteDescription}
                onChange={(e) => setZhSiteDescription(e.target.value)}
                placeholder="Nguồn cung hạnh nhân California ổn định cho thị trường Mỹ và quốc tế…"
              />
            </div>
            <div>
              <label className="gf-label">Tên logo (Tiếng Việt)</label>
              <input
                className="gf-control"
                value={zhBrandName}
                onChange={(e) => setZhBrandName(e.target.value)}
                placeholder="Prime Nuts USA"
              />
            </div>
            <div>
              <label className="gf-label">Dòng chữ cuối trang (Tiếng Việt)</label>
              <input
                className="gf-control"
                value={zhFooterText}
                onChange={(e) => setZhFooterText(e.target.value)}
                placeholder="Hạnh nhân California. Thị trường toàn cầu. Nguồn cung tin cậy."
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
                  <X size={14} /> Bỏ logo
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
            <span style={{ fontSize: postTitleSize }}>2026 California Almond Crop: What Buyers Should Watch</span>
          </div>
          <p className="gf-hint">
            Áp cho tiêu đề (H1) trang chi tiết bài viết trong mục News. Đây là cỡ lớn nhất
            trên desktop; màn hình nhỏ tự co lại nên không cần chỉnh riêng cho mobile.
            Mặc định {POST_TITLE_DEFAULT}px.
          </p>
        </div>
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Màu sắc theme</h2>
        <p className="gf-hint st-soon">⏳ Chưa nối với giao diện site hiện tại — giá trị vẫn lưu và sẽ áp dụng khi nối.</p>
        <p className="gf-hint">
          Ghi đè token màu của theme. Ô nào chưa đổi sẽ dùng màu mặc định; bấm ↺ để trả một màu về mặc định.
        </p>
        <div className="st-colors-grid">
          {(['dark', 'light'] as const).map((theme) => {
            const overrides = theme === 'dark' ? colorsDark : colorsLight;
            return (
              <div key={theme} className="st-color-group">
                <h3>{theme === 'dark' ? '🌙 Theme tối (mặc định)' : '☀️ Theme sáng'}</h3>
                {COLOR_TOKENS.map((token) => {
                  const fallback = theme === 'dark' ? token.darkDefault : token.lightDefault;
                  const current = overrides[token.key] ?? fallback;
                  const isOverridden = overrides[token.key] != null;
                  return (
                    <div key={token.key} className="st-color-row">
                      <span className="st-color-label">
                        {token.label}
                        {isOverridden && <em> (đã đổi)</em>}
                      </span>
                      <div className="st-color-controls">
                        <input
                          type="color"
                          value={current}
                          onChange={(e) => setColor(theme, token.key, e.target.value)}
                        />
                        <code>{current}</code>
                        {isOverridden && (
                          <button
                            type="button"
                            className="st-color-reset"
                            onClick={() => clearColor(theme, token.key)}
                            title="Trả về màu mặc định"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Mạng xã hội</h2>
        <p className="gf-hint st-soon">⏳ Chưa nối với giao diện site hiện tại — giá trị vẫn lưu và sẽ áp dụng khi nối.</p>
        <p className="gf-hint" style={{ marginTop: -6 }}>
          Để trống mạng nào thì ẩn mạng đó khi được hiển thị ngoài website.
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
        <h2 className="st-section-title">Tính năng website</h2>
        <p className="gf-hint st-soon">⏳ Hai tuỳ chọn này chưa nối với giao diện site hiện tại.</p>
        <label className="gf-check st-feature">
          <input
            type="checkbox"
            checked={showPostMeta}
            onChange={(e) => setShowPostMeta(e.target.checked)}
          />
          <span>
            <strong>Hiện ngày đăng &amp; số phút đọc trên bài viết</strong>
            <small>Dòng &ldquo;23/08/2026 · 2 phút đọc&rdquo; trên thẻ bài viết và trang chi tiết. Tắt để ẩn trên toàn website.</small>
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
            <small>Chặn chuột phải, bôi đen và Ctrl+C trên website. Là rào mềm phía trình duyệt, không chặn tuyệt đối được người dùng kỹ thuật.</small>
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
          if (pickerTarget === 'favicon') setFaviconUrl(url);
          if (pickerTarget === 'hero') setHeroImageUrl(url);
          if (pickerTarget === 'og') setOgImageUrl(url);
        }}
      />
    </div>
  );
}

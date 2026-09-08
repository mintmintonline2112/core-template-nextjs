'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { getErrorMessage, resolveImageUrl } from '@/app/admin/_lib/utils';
import { settingsService, SETTINGS_QUERY_KEY } from '@/app/admin/(protected)/settings/_lib/settings.service';
import { LibraryPicker } from '@/app/admin/_components/library-picker/library-picker';
import type { ContactInterest, ContactPageConfig } from '@/lib/contact-page';
import { DEFAULT_INTERESTS } from '@/lib/contact-page';

/**
 * Admin → Trang Liên hệ: mọi thứ khách hàng tự chỉnh cho /lien-he gom về một chỗ.
 * Lưu vào site_settings key `contactPage` (1 JSON) — public đọc qua
 * getSiteSettings().contactPage. Trường trống → website dùng mặc định.
 * Thứ tự khối trùng thứ tự hiển thị ngoài trang: tiêu đề → liên hệ ưu tiên
 * (hotline + Zalo QR) → mạng xã hội → thông tin liên hệ → form.
 */

type Hero = { eyebrow: string; title: string; lead: string; zhEyebrow: string; zhTitle: string; zhLead: string };
type Hotline = { enabled: boolean; phone: string; label: string; note: string; zhLabel: string; zhNote: string };
type Zalo = { qrUrl: string; url: string };
type Social = { facebook: string; youtube: string; instagram: string; tiktok: string };
type Clinic = {
  enabled: boolean; name: string; address: string; phone: string; email: string; hours: string;
  mapUrl: string; mapEmbedUrl: string; zhName: string; zhAddress: string; zhHours: string;
};
type FormCfg = { enabled: boolean; kicker: string; title: string; note: string; zhKicker: string; zhTitle: string; zhNote: string };
type Interest = { value: string; zh: string };

const EMPTY_HERO: Hero = { eyebrow: '', title: '', lead: '', zhEyebrow: '', zhTitle: '', zhLead: '' };
const EMPTY_HOTLINE: Hotline = { enabled: true, phone: '', label: '', note: '', zhLabel: '', zhNote: '' };
const EMPTY_ZALO: Zalo = { qrUrl: '', url: '' };
const EMPTY_SOCIAL: Social = { facebook: '', youtube: '', instagram: '', tiktok: '' };
const EMPTY_CLINIC: Clinic = {
  enabled: true, name: '', address: '', phone: '', email: '', hours: '', mapUrl: '', mapEmbedUrl: '',
  zhName: '', zhAddress: '', zhHours: '',
};
const EMPTY_FORM: FormCfg = { enabled: true, kicker: '', title: '', note: '', zhKicker: '', zhTitle: '', zhNote: '' };

const s = (v: unknown) => (typeof v === 'string' ? v : '');
const clean = <T extends Record<string, unknown>>(obj: T): Partial<T> | undefined => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') { if (v.trim()) out[k] = v.trim(); }
    else if (v !== undefined && v !== null && !(typeof v === 'object' && !Object.keys(v as object).length)) out[k] = v;
  }
  return Object.keys(out).length ? (out as Partial<T>) : undefined;
};

export function ContactPageScreen() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [hero, setHero] = useState<Hero>(EMPTY_HERO);
  const [hotline, setHotline] = useState<Hotline>(EMPTY_HOTLINE);
  const [zalo, setZalo] = useState<Zalo>(EMPTY_ZALO);
  const [qrPickerOpen, setQrPickerOpen] = useState(false);
  const [social, setSocial] = useState<Social>(EMPTY_SOCIAL);
  const [clinic, setClinic] = useState<Clinic>(EMPTY_CLINIC);
  const [form, setForm] = useState<FormCfg>(EMPTY_FORM);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [newInterest, setNewInterest] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [...SETTINGS_QUERY_KEY],
    queryFn: () => settingsService.get(),
  });

  useEffect(() => {
    if (!data) return;
    const cfg = (data.contactPage ?? {}) as ContactPageConfig;
    setHero({
      eyebrow: s(cfg.hero?.eyebrow), title: s(cfg.hero?.title), lead: s(cfg.hero?.lead),
      zhEyebrow: s(cfg.hero?.vi?.eyebrow), zhTitle: s(cfg.hero?.vi?.title), zhLead: s(cfg.hero?.vi?.lead),
    });
    setHotline({
      enabled: cfg.hotline?.enabled !== false,
      phone: s(cfg.hotline?.phone), label: s(cfg.hotline?.label), note: s(cfg.hotline?.note),
      zhLabel: s(cfg.hotline?.vi?.label), zhNote: s(cfg.hotline?.vi?.note),
    });
    setZalo({ qrUrl: s(cfg.zalo?.qrUrl), url: s(cfg.zalo?.url) });
    const so = cfg.social ?? data.socialLinks ?? {};
    setSocial({ facebook: s(so.facebook), youtube: s(so.youtube), instagram: s(so.instagram), tiktok: s(so.tiktok) });
    setClinic({
      enabled: cfg.clinic?.enabled !== false,
      name: s(cfg.clinic?.name), address: s(cfg.clinic?.address), phone: s(cfg.clinic?.phone),
      email: s(cfg.clinic?.email), hours: s(cfg.clinic?.hours), mapUrl: s(cfg.clinic?.mapUrl),
      mapEmbedUrl: s(cfg.clinic?.mapEmbedUrl),
      zhName: s(cfg.clinic?.vi?.name), zhAddress: s(cfg.clinic?.vi?.address), zhHours: s(cfg.clinic?.vi?.hours),
    });
    setForm({
      enabled: cfg.form?.enabled !== false,
      kicker: s(cfg.form?.kicker), title: s(cfg.form?.title), note: s(cfg.form?.note),
      zhKicker: s(cfg.form?.vi?.kicker), zhTitle: s(cfg.form?.vi?.title), zhNote: s(cfg.form?.vi?.note),
    });
    const list = cfg.form?.interests?.length ? cfg.form.interests : DEFAULT_INTERESTS;
    setInterests(list.map((i: ContactInterest) => ({ value: s(i.value), zh: s(i.vi) })));
  }, [data]);

  function moveInterest(index: number, dir: -1 | 1) {
    setInterests((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addInterest() {
    const value = newInterest.trim();
    if (!value) return;
    if (interests.some((i) => i.value.toLowerCase() === value.toLowerCase())) {
      toast.error('Nhu cầu này đã có trong danh sách');
      return;
    }
    setInterests((prev) => [...prev, { value, zh: '' }]);
    setNewInterest('');
  }

  async function handleSave() {
    setSaving(true);
    try {
      const contactPage: ContactPageConfig = {
        hero: clean({
          eyebrow: hero.eyebrow, title: hero.title, lead: hero.lead,
          vi: clean({ eyebrow: hero.zhEyebrow, title: hero.zhTitle, lead: hero.zhLead }),
        }),
        hotline: clean({
          enabled: hotline.enabled,
          phone: hotline.phone, label: hotline.label, note: hotline.note,
          vi: clean({ label: hotline.zhLabel, note: hotline.zhNote }),
        }),
        zalo: clean({ ...zalo }),
        social: clean({ ...social }),
        clinic: clean({
          enabled: clinic.enabled,
          name: clinic.name, address: clinic.address, phone: clinic.phone, email: clinic.email,
          hours: clinic.hours, mapUrl: clinic.mapUrl, mapEmbedUrl: clinic.mapEmbedUrl,
          vi: clean({ name: clinic.zhName, address: clinic.zhAddress, hours: clinic.zhHours }),
        }),
        form: clean({
          enabled: form.enabled,
          kicker: form.kicker, title: form.title, note: form.note,
          interests: interests
            .map((i) => ({ value: i.value.trim(), ...(i.zh.trim() ? { vi: i.zh.trim() } : {}) }))
            .filter((i) => i.value),
          vi: clean({ kicker: form.zhKicker, title: form.zhTitle, note: form.zhNote }),
        }),
      };
      // dọn key undefined để JSON gọn
      const payload = JSON.parse(JSON.stringify({ contactPage, socialLinks: contactPage.social ?? null }));
      await settingsService.update(payload);
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      toast.success('Đã lưu — trang Liên hệ cập nhật ngay');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <p className="dt-empty">Đang tải cấu hình…</p>;

  const field = (
    label: string, value: string, onChange: (v: string) => void,
    opts: { placeholder?: string; hint?: string; rows?: number; type?: string } = {},
  ) => (
    <div>
      <label className="gf-label">{label}</label>
      {opts.rows ? (
        <textarea className="gf-control" rows={opts.rows} value={value} placeholder={opts.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="gf-control" type={opts.type ?? 'text'} value={value} placeholder={opts.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {opts.hint && <p className="gf-hint">{opts.hint}</p>}
    </div>
  );

  return (
    <div className="st-screen">
      <div className="adm-page-header is-row">
        <div>
          <h1 className="adm-page-title">Trang Liên hệ</h1>
          <p className="adm-page-subtitle">
            Tiêu đề, mạng xã hội, thông tin liên hệ và form tư vấn hiển thị tại /lien-he
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="adm-btn" href="/lien-he" target="_blank" rel="noopener noreferrer">
            Xem trang ↗
          </a>
          <button type="button" className="adm-btn adm-btn--primary" onClick={handleSave} disabled={saving}>
            {saving && <span className="adm-spin" />}
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* 1. Tiêu đề trang */}
      <section className="gf-card st-section">
        <h2 className="st-section-title">Tiêu đề trang</h2>
        {field('Dòng nhỏ phía trên (eyebrow)', hero.eyebrow, (v) => setHero({ ...hero, eyebrow: v }), { placeholder: 'Kết nối' })}
        {field('Tiêu đề', hero.title, (v) => setHero({ ...hero, title: v }), { placeholder: 'Liên hệ tư vấn' })}
        {field('Đoạn dẫn', hero.lead, (v) => setHero({ ...hero, lead: v }), {
          rows: 2, placeholder: 'Chia sẻ tình trạng và nhu cầu của bạn để nhận hướng dẫn cho bước thăm khám phù hợp.',
          hint: 'Để trống thì dùng nội dung mặc định.',
        })}
        <details className="gf-group">
          <summary className="gf-group-summary"><strong>Bản dịch tiếng Việt</strong><small>Để trống thì website dùng bản tiếng Anh.</small></summary>
          <div className="gf-group-body">
            {field('Eyebrow (Tiếng Việt)', hero.zhEyebrow, (v) => setHero({ ...hero, zhEyebrow: v }), { placeholder: '联系我们' })}
            {field('Tiêu đề (Tiếng Việt)', hero.zhTitle, (v) => setHero({ ...hero, zhTitle: v }), { placeholder: '联系咨询' })}
            {field('Đoạn dẫn (Tiếng Việt)', hero.zhLead, (v) => setHero({ ...hero, zhLead: v }), { rows: 2 })}
          </div>
        </details>
      </section>

      {/* 2. Liên hệ ưu tiên: hotline + Zalo QR */}
      <section className="gf-card st-section">
        <h2 className="st-section-title">Liên hệ ưu tiên</h2>
        <p className="gf-hint" style={{ marginTop: -6 }}>
          Hai khung đứng đầu mục &ldquo;Kết nối với chúng tôi&rdquo;: số điện thoại (khung to nhất — bấm là gọi) và mã QR Zalo.
        </p>
        <label className="gf-check st-feature">
          <input type="checkbox" checked={hotline.enabled} onChange={(e) => setHotline({ ...hotline, enabled: e.target.checked })} />
          <span>
            <strong>Hiện khung số điện thoại</strong>
            <small>Khung lớn &ldquo;Gọi trực tiếp&rdquo; nằm trên cùng. Tắt thì ẩn, các khung khác dồn lên.</small>
          </span>
        </label>
        {field('Số điện thoại', hotline.phone, (v) => setHotline({ ...hotline, phone: v }), {
          placeholder: '0909881687', type: 'tel',
          hint: 'Để trống thì dùng số ở khối "Thông tin liên hệ" bên dưới. Nhập 10 số liền, website tự tách "0909 881 687".',
        })}
        <div className="st-media-row">
          <div>{field('Nhãn phía trên số', hotline.label, (v) => setHotline({ ...hotline, label: v }), { placeholder: 'Gọi trực tiếp' })}</div>
          <div>{field('Ghi chú dưới số', hotline.note, (v) => setHotline({ ...hotline, note: v }), { placeholder: 'Cách liên hệ nhanh nhất — nhấn để gọi ngay' })}</div>
        </div>

        <div className="st-media-row">
          <div className="st-media">
            <label className="gf-label">Ảnh mã QR Zalo</label>
            <div className="st-media-preview is-square">
              {zalo.qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveImageUrl(zalo.qrUrl) ?? ''} alt="QR Zalo" style={{ height: 140, width: 140 }} />
              ) : (
                <span className="st-media-empty">Chưa đặt — chưa hiện khung Zalo</span>
              )}
            </div>
            <div className="st-media-actions">
              <button type="button" className="adm-btn" onClick={() => setQrPickerOpen(true)}>
                Chọn từ Thư viện
              </button>
              {zalo.qrUrl && (
                <button type="button" className="adm-btn" onClick={() => setZalo({ ...zalo, qrUrl: '' })}>
                  <X size={14} /> Bỏ ảnh
                </button>
              )}
            </div>
            <p className="gf-hint">
              Lấy trong app Zalo → Cá nhân → mã QR của tôi → Lưu ảnh (ảnh vuông, nền trắng). Trên máy tính khách quét mã; trên điện thoại bấm khung là mở Zalo.
            </p>
          </div>
          <div>
            {field('Link mở Zalo (tùy chọn)', zalo.url, (v) => setZalo({ ...zalo, url: v }), {
              placeholder: 'https://zalo.me/0909881687', type: 'url',
              hint: 'Để trống thì tự dùng zalo.me/<số điện thoại ở trên>. Nhập link OA nếu phòng khám dùng Zalo Official Account.',
            })}
          </div>
        </div>

        <details className="gf-group">
          <summary className="gf-group-summary"><strong>Bản dịch tiếng Việt</strong><small>Số điện thoại và QR dùng chung.</small></summary>
          <div className="gf-group-body">
            {field('Nhãn phía trên số (Tiếng Việt)', hotline.zhLabel, (v) => setHotline({ ...hotline, zhLabel: v }), { placeholder: '直接致电' })}
            {field('Ghi chú dưới số (Tiếng Việt)', hotline.zhNote, (v) => setHotline({ ...hotline, zhNote: v }), { placeholder: '最快捷的联系方式 — 点击立即拨打' })}
          </div>
        </details>
      </section>

      {/* 3. Mạng xã hội */}
      <section className="gf-card st-section">
        <h2 className="st-section-title">Mạng xã hội</h2>
        <p className="gf-hint" style={{ marginTop: -6 }}>
          Các khung nằm dưới hotline và Zalo trong mục &ldquo;Kết nối với chúng tôi&rdquo;. Để trống mạng nào thì ẩn mạng đó.
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
            {field(label, social[key], (v) => setSocial({ ...social, [key]: v }), { placeholder, type: 'url' })}
          </div>
        ))}
      </section>

      {/* 4. Thông tin liên hệ */}
      <section className="gf-card st-section">
        <h2 className="st-section-title">Thông tin liên hệ</h2>
        <label className="gf-check st-feature">
          <input type="checkbox" checked={clinic.enabled} onChange={(e) => setClinic({ ...clinic, enabled: e.target.checked })} />
          <span>
            <strong>Hiện khối thông tin liên hệ</strong>
            <small>Địa chỉ, điện thoại, email, giờ làm việc và bản đồ. Tắt thì ẩn cả khối.</small>
          </span>
        </label>
        {field('Tên liên hệ', clinic.name, (v) => setClinic({ ...clinic, name: v }), { placeholder: 'Prime Nuts USA' })}
        {field('Địa chỉ', clinic.address, (v) => setClinic({ ...clinic, address: v }), { rows: 2, placeholder: 'Số nhà, đường, phường, quận, thành phố' })}
        <div className="st-media-row">
          <div style={{ flex: 1 }}>{field('Điện thoại', clinic.phone, (v) => setClinic({ ...clinic, phone: v }), { placeholder: '09xx xxx xxx', type: 'tel', hint: 'Hiện nút "Gọi ngay" trên di động.' })}</div>
          <div style={{ flex: 1 }}>{field('Email', clinic.email, (v) => setClinic({ ...clinic, email: v }), { placeholder: 'lienhe@phongkham.vn', type: 'email' })}</div>
        </div>
        {field('Giờ làm việc', clinic.hours, (v) => setClinic({ ...clinic, hours: v }), {
          rows: 3, placeholder: 'Thứ 2 – Thứ 7: 8:00 – 19:00\nChủ nhật: 8:00 – 12:00', hint: 'Mỗi dòng một khung giờ — website giữ nguyên xuống dòng.',
        })}
        {field('Link Google Maps (nút "Xem bản đồ")', clinic.mapUrl, (v) => setClinic({ ...clinic, mapUrl: v }), { placeholder: 'https://maps.app.goo.gl/...', type: 'url' })}
        {field('Link nhúng bản đồ (tùy chọn)', clinic.mapEmbedUrl, (v) => setClinic({ ...clinic, mapEmbedUrl: v }), {
          placeholder: 'https://www.google.com/maps/embed?pb=...', type: 'url',
          hint: 'Google Maps → Chia sẻ → Nhúng bản đồ → copy đúng phần src="..." của iframe. Có link này thì bản đồ hiện cạnh thông tin.',
        })}
        <details className="gf-group">
          <summary className="gf-group-summary"><strong>Bản dịch tiếng Việt</strong><small>Điện thoại / email dùng chung, chỉ dịch tên, địa chỉ, giờ.</small></summary>
          <div className="gf-group-body">
            {field('Tên liên hệ (Tiếng Việt)', clinic.zhName, (v) => setClinic({ ...clinic, zhName: v }))}
            {field('Địa chỉ (Tiếng Việt)', clinic.zhAddress, (v) => setClinic({ ...clinic, zhAddress: v }), { rows: 2 })}
            {field('Giờ làm việc (Tiếng Việt)', clinic.zhHours, (v) => setClinic({ ...clinic, zhHours: v }), { rows: 3 })}
          </div>
        </details>
      </section>

      {/* 5. Form tư vấn */}
      <section className="gf-card st-section">
        <h2 className="st-section-title">Form tư vấn</h2>
        <label className="gf-check st-feature">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          <span>
            <strong>Hiện form gửi yêu cầu tư vấn</strong>
            <small>Yêu cầu gửi về mục Khách hàng → Liên hệ và chuông thông báo. Tắt thì trang chỉ còn thông tin + mạng xã hội.</small>
          </span>
        </label>
        {field('Dòng nhỏ phía trên', form.kicker, (v) => setForm({ ...form, kicker: v }), { placeholder: 'Đặt lịch tư vấn' })}
        {field('Tiêu đề khối', form.title, (v) => setForm({ ...form, title: v }), { placeholder: 'Gửi yêu cầu cho liên hệ' })}
        {field('Ghi chú dưới nút gửi', form.note, (v) => setForm({ ...form, note: v }), {
          rows: 2, placeholder: 'Thông tin của bạn chỉ dùng để liên hệ liên hệ tư vấn, không chia sẻ cho bên thứ ba.',
        })}

        <div>
          <label className="gf-label">Danh sách &ldquo;Nhu cầu quan tâm&rdquo;</label>
          <p className="gf-hint" style={{ marginTop: 0 }}>
            Các lựa chọn trong ô chọn dịch vụ của form. Cột 中文 là nhãn hiện ở bản tiếng Trung (để trống thì dùng tiếng Việt).
          </p>
          <div className="cp-interests">
            {interests.map((item, index) => (
              <div className="cp-interest-row" key={`${item.value}-${index}`}>
                <input
                  className="gf-control"
                  value={item.value}
                  onChange={(e) => setInterests((prev) => prev.map((it, i) => (i === index ? { ...it, value: e.target.value } : it)))}
                  placeholder="Tên nhu cầu (tiếng Việt)"
                />
                <input
                  className="gf-control"
                  value={item.zh}
                  onChange={(e) => setInterests((prev) => prev.map((it, i) => (i === index ? { ...it, zh: e.target.value } : it)))}
                  placeholder="中文"
                />
                <div className="cp-interest-actions">
                  <button type="button" className="adm-icon-btn" title="Lên" disabled={index === 0} onClick={() => moveInterest(index, -1)}><ArrowUp size={15} /></button>
                  <button type="button" className="adm-icon-btn" title="Xuống" disabled={index === interests.length - 1} onClick={() => moveInterest(index, 1)}><ArrowDown size={15} /></button>
                  <button type="button" className="adm-icon-btn is-danger" title="Xóa" onClick={() => setInterests((prev) => prev.filter((_, i) => i !== index))}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            <div className="cp-interest-row is-new">
              <input
                className="gf-control"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                placeholder="Thêm nhu cầu mới, ví dụ: Tư vấn cấy ghép Implant"
              />
              <button type="button" className="adm-btn" onClick={addInterest}><Plus size={15} /> Thêm</button>
            </div>
          </div>
        </div>

        <details className="gf-group">
          <summary className="gf-group-summary"><strong>Bản dịch tiếng Việt</strong></summary>
          <div className="gf-group-body">
            {field('Dòng nhỏ (Tiếng Việt)', form.zhKicker, (v) => setForm({ ...form, zhKicker: v }), { placeholder: '预约咨询' })}
            {field('Tiêu đề khối (Tiếng Việt)', form.zhTitle, (v) => setForm({ ...form, zhTitle: v }), { placeholder: '向诊所发送预约请求' })}
            {field('Ghi chú (Tiếng Việt)', form.zhNote, (v) => setForm({ ...form, zhNote: v }), { rows: 2 })}
          </div>
        </details>
      </section>

      <LibraryPicker
        open={qrPickerOpen}
        onClose={() => setQrPickerOpen(false)}
        onSelect={(url) => setZalo((prev) => ({ ...prev, qrUrl: url }))}
      />
    </div>
  );
}

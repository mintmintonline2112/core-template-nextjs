'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/app/admin/_lib/utils';
import { settingsService, SETTINGS_QUERY_KEY } from '@/app/admin/(protected)/settings/_lib/settings.service';
import { siteRoutes } from '@/config/routes';
import type { ContactInterest, ContactPageConfig } from '@/lib/contact-page';
import { DEFAULT_INTERESTS } from '@/lib/contact-page';

/**
 * Admin → Trang Liên hệ: mọi thứ khách hàng tự chỉnh cho trang Liên hệ gom về một chỗ.
 * Lưu vào site_settings key `contactPage` (1 JSON) — public đọc qua
 * getSiteSettings().contactPage. Trường trống → website dùng mặc định.
 * Thứ tự khối trùng thứ tự hiển thị ngoài trang: tiêu đề → liên hệ ưu tiên
 * → mạng xã hội → thông tin công ty → form.
 */

type Hero = { eyebrow: string; title: string; lead: string; zhEyebrow: string; zhTitle: string; zhLead: string };
type Social = { facebook: string; youtube: string; instagram: string; tiktok: string };
type Company = {
  name: string; location: string; address: string; phone: string; email: string;
  mapUrl: string; zhName: string; zhLocation: string; zhAddress: string;
};
type FormCfg = { enabled: boolean; kicker: string; title: string; note: string; zhKicker: string; zhTitle: string; zhNote: string };
type Interest = { value: string; zh: string };

const EMPTY_HERO: Hero = { eyebrow: '', title: '', lead: '', zhEyebrow: '', zhTitle: '', zhLead: '' };
const EMPTY_SOCIAL: Social = { facebook: '', youtube: '', instagram: '', tiktok: '' };
const EMPTY_COMPANY: Company = {
  name: '', location: '', address: '', phone: '', email: '', mapUrl: '',
  zhName: '', zhLocation: '', zhAddress: '',
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
  const [social, setSocial] = useState<Social>(EMPTY_SOCIAL);
  const [company, setCompany] = useState<Company>(EMPTY_COMPANY);
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
    const so = cfg.social ?? data.socialLinks ?? {};
    setSocial({ facebook: s(so.facebook), youtube: s(so.youtube), instagram: s(so.instagram), tiktok: s(so.tiktok) });
    setCompany({
      name: s(cfg.company?.name), location: s(cfg.company?.location),
      address: s(cfg.company?.address), phone: s(cfg.company?.phone),
      email: s(cfg.company?.email), mapUrl: s(cfg.company?.mapUrl),
      zhName: s(cfg.company?.vi?.name), zhLocation: s(cfg.company?.vi?.location),
      zhAddress: s(cfg.company?.vi?.address),
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
        social: clean({ ...social }),
        company: clean({
          name: company.name, location: company.location, address: company.address,
          phone: company.phone, email: company.email, mapUrl: company.mapUrl,
          vi: clean({ name: company.zhName, location: company.zhLocation, address: company.zhAddress }),
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
            Tiêu đề, mạng xã hội, thông tin công ty và form báo giá hiển thị tại trang Liên hệ
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="adm-btn" href={siteRoutes.contact} target="_blank" rel="noopener noreferrer">
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

      {/* 2. Mạng xã hội */}
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

      {/* 3. Thông tin công ty */}
      <section className="gf-card st-section">
        <h2 className="st-section-title">Thông tin công ty</h2>
        <p className="gf-hint" style={{ marginTop: -6 }}>
          Hiện ở trang Liên hệ và chân trang. Để trống ô nào thì website dùng giá trị mặc định trong code.
        </p>
        {field('Tên công ty', company.name, (v) => setCompany({ ...company, name: v }), { placeholder: 'Prime Nuts USA' })}
        <div className="st-media-row">
          <div style={{ flex: 1 }}>{field('Quốc gia / khu vực', company.location, (v) => setCompany({ ...company, location: v }), { placeholder: 'Việt Nam' })}</div>
          <div style={{ flex: 1 }}>{field('Điện thoại', company.phone, (v) => setCompany({ ...company, phone: v }), { placeholder: '090 119 3378', type: 'tel' })}</div>
        </div>
        {field('Địa chỉ', company.address, (v) => setCompany({ ...company, address: v }), { rows: 2, placeholder: 'Số nhà, đường, phường, quận, thành phố' })}
        {field('Email', company.email, (v) => setCompany({ ...company, email: v }), { placeholder: 'hello@primenuts.vn', type: 'email' })}
        {field('Link Google Maps (tùy chọn)', company.mapUrl, (v) => setCompany({ ...company, mapUrl: v }), { placeholder: 'https://maps.app.goo.gl/...', type: 'url' })}
        <details className="gf-group">
          <summary className="gf-group-summary"><strong>Bản dịch tiếng Việt</strong><small>Điện thoại / email dùng chung, chỉ dịch tên và địa chỉ.</small></summary>
          <div className="gf-group-body">
            {field('Tên công ty (Tiếng Việt)', company.zhName, (v) => setCompany({ ...company, zhName: v }))}
            {field('Quốc gia / khu vực (Tiếng Việt)', company.zhLocation, (v) => setCompany({ ...company, zhLocation: v }))}
            {field('Địa chỉ (Tiếng Việt)', company.zhAddress, (v) => setCompany({ ...company, zhAddress: v }), { rows: 2 })}
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

    </div>
  );
}

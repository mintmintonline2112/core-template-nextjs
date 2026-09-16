'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ImageIcon, Plus, Trash2 } from 'lucide-react';
import { LibraryPicker } from '@/app/admin/_components/library-picker/library-picker';
import type { SectionDefinition, SectionFieldSpec } from '@/app/admin/(protected)/page-sections/_lib/page-section.service';

/**
 * Khu chỉnh sửa metadata TRỰC QUAN theo danh mục component
 * (bảng section_definitions): chọn bố cục, danh sách chuỗi, danh sách mục có
 * ảnh/chú thích, nhóm ô chữ, ảnh đơn — thêm/xóa/di chuyển bằng nút bấm, chọn
 * ảnh từ Thư viện, không cần biết JSON. Field có `layouts` chỉ hiện khi bố cục
 * đang chọn thuộc danh sách đó.
 *
 * `translation` = chế độ dịch: chỉ hiện ô chữ (bỏ bố cục, ảnh, JSON) — bản dịch
 * đè lên bản gốc theo từng key khi website chạy ?lang=vi.
 */

type Meta = Record<string, unknown>;

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function RowControls({
  index,
  total,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="me-row-controls">
      <button type="button" className="adm-icon-btn" title="Lên" disabled={index === 0} onClick={() => onMove(index - 1)}>
        <ChevronUp size={14} />
      </button>
      <button type="button" className="adm-icon-btn" title="Xuống" disabled={index === total - 1} onClick={() => onMove(index + 1)}>
        <ChevronDown size={14} />
      </button>
      <button type="button" className="adm-icon-btn me-remove" title="Xóa" onClick={onRemove}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/** Chọn một giá trị (VD bố cục) — dãy nút bấm. */
function SelectFieldEditor({
  spec,
  value,
  onChange,
}: {
  spec: Extract<SectionFieldSpec, { type: 'select' }>;
  value: unknown;
  onChange: (next: string) => void;
}) {
  const current = typeof value === 'string' ? value : spec.options[0]?.value;
  const active = spec.options.find((option) => option.value === current);
  return (
    <div className="me-field">
      <label className="gf-label">{spec.label}</label>
      <div className="me-segmented" role="radiogroup" aria-label={spec.label}>
        {spec.options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === current}
            className={`me-segment${option.value === current ? ' is-active' : ''}`}
            title={option.hint}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {active?.hint ? <p className="gf-hint">{active.hint}</p> : null}
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}

function StringListEditor({
  spec,
  value,
  onChange,
}: {
  spec: Extract<SectionFieldSpec, { type: 'stringList' }>;
  value: unknown;
  onChange: (next: string[]) => void;
}) {
  const items = asArray(value).map((item) => (typeof item === 'string' ? item : String(item ?? '')));
  return (
    <div className="me-field">
      <div className="me-field-head">
        <label className="gf-label">{spec.label}</label>
        <button type="button" className="adm-btn adm-btn--sm" onClick={() => onChange([...items, ''])}>
          <Plus size={13} /> Thêm dòng
        </button>
      </div>
      {items.map((item, index) => (
        <div className="me-row" key={index}>
          <input
            className="gf-control"
            value={item}
            onChange={(e) => onChange(items.map((v, i) => (i === index ? e.target.value : v)))}
          />
          <RowControls
            index={index}
            total={items.length}
            onMove={(to) => onChange(move(items, index, to))}
            onRemove={() => onChange(items.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}

function ItemListEditor({
  spec,
  value,
  onChange,
  onPickImage,
  translation,
}: {
  spec: Extract<SectionFieldSpec, { type: 'itemList' }>;
  value: unknown;
  onChange: (next: Array<Record<string, string>>) => void;
  onPickImage: (apply: (url: string) => void) => void;
  translation: boolean;
}) {
  const firstField = spec.itemFields[0]?.name ?? 'value';
  // Chế độ dịch: chỉ ô chữ (ảnh lấy theo bản gốc).
  const fields = translation ? spec.itemFields.filter((field) => field.kind !== 'image') : spec.itemFields;
  // Chấp nhận cả item dạng chuỗi cũ ('Commercial Invoice') lẫn object.
  const items = asArray(value).map((item) => {
    if (typeof item === 'string') return { [firstField]: item } as Record<string, string>;
    if (item && typeof item === 'object') {
      const out: Record<string, string> = {};
      for (const field of spec.itemFields) {
        const raw = (item as Record<string, unknown>)[field.name];
        out[field.name] = typeof raw === 'string' ? raw : raw == null ? '' : String(raw);
      }
      return out;
    }
    return {} as Record<string, string>;
  });

  const setField = (index: number, name: string, fieldValue: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [name]: fieldValue } : item)));

  return (
    <div className="me-field">
      <div className="me-field-head">
        <label className="gf-label">{spec.label}</label>
        <button
          type="button"
          className="adm-btn adm-btn--sm"
          onClick={() => onChange([...items, Object.fromEntries(spec.itemFields.map((f) => [f.name, '']))])}
        >
          <Plus size={13} /> Thêm mục
        </button>
      </div>
      {items.map((item, index) => (
        <div className="me-card" key={index}>
          <div className="me-card-fields">
            {fields.map((field) => (
              <div key={field.name} className="me-card-field">
                <label className="gf-label">{field.label}</label>
                {field.kind === 'image' ? (
                  <div className="me-image-row">
                    <input
                      className="gf-control"
                      value={item[field.name] ?? ''}
                      placeholder="/images/... hoặc chọn từ Thư viện"
                      onChange={(e) => setField(index, field.name, e.target.value)}
                    />
                    <button
                      type="button"
                      className="adm-btn adm-btn--sm"
                      onClick={() => onPickImage((url) => setField(index, field.name, url))}
                    >
                      <ImageIcon size={13} /> Thư viện
                    </button>
                    {item[field.name] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="me-thumb" src={item[field.name]} alt="" />
                    ) : null}
                  </div>
                ) : field.kind === 'textarea' ? (
                  <textarea
                    className="gf-control"
                    rows={2}
                    value={item[field.name] ?? ''}
                    onChange={(e) => setField(index, field.name, e.target.value)}
                  />
                ) : (
                  <input
                    className="gf-control"
                    value={item[field.name] ?? ''}
                    onChange={(e) => setField(index, field.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <RowControls
            index={index}
            total={items.length}
            onMove={(to) => onChange(move(items, index, to))}
            onRemove={() => onChange(items.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}

/** Một ô ảnh đơn của khối (VD ảnh lớn cột phải của FAQ) — gõ URL hoặc chọn Thư viện. */
function ImageFieldEditor({
  spec,
  value,
  onChange,
  onPickImage,
}: {
  spec: Extract<SectionFieldSpec, { type: 'image' }>;
  value: unknown;
  onChange: (next: string | undefined) => void;
  onPickImage: (apply: (url: string) => void) => void;
}) {
  const url = typeof value === 'string' ? value : '';

  return (
    <div className="me-field">
      <label className="gf-label">{spec.label}</label>
      <div className="me-image-row">
        <input
          className="gf-control"
          value={url}
          placeholder="/images/... hoặc chọn từ Thư viện"
          onChange={(e) => onChange(e.target.value || undefined)}
        />
        <button type="button" className="adm-btn adm-btn--sm" onClick={() => onPickImage((picked) => onChange(picked))}>
          <ImageIcon size={13} /> Thư viện
        </button>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="me-thumb" src={url} alt="" />
        ) : null}
      </div>
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}

function TextMapEditor({
  spec,
  meta,
  onChange,
}: {
  spec: Extract<SectionFieldSpec, { type: 'textMap' }>;
  meta: Meta;
  onChange: (next: Meta) => void;
}) {
  const atRoot = spec.key === '__self__';
  const target = atRoot ? meta : ((meta[spec.key] as Meta | undefined) ?? {});

  const setField = (name: string, value: string) => {
    const nextTarget = { ...target, [name]: value };
    onChange(atRoot ? nextTarget : { ...meta, [spec.key]: nextTarget });
  };

  return (
    <div className="me-field">
      <label className="gf-label">{spec.label}</label>
      <div className="me-card-fields">
        {spec.fields.map((field) => (
          <div key={field.name} className="me-card-field">
            <label className="gf-label">{field.label}</label>
            <input
              className="gf-control"
              value={typeof target[field.name] === 'string' ? (target[field.name] as string) : ''}
              onChange={(e) => setField(field.name, e.target.value)}
            />
          </div>
        ))}
      </div>
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}

function JsonKeyEditor({
  spec,
  value,
  onChange,
}: {
  spec: Extract<SectionFieldSpec, { type: 'json' }>;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [draft, setDraft] = useState(() => (value == null ? '' : JSON.stringify(value, null, 2)));
  const [error, setError] = useState(false);
  return (
    <div className="me-field">
      <label className="gf-label">{spec.label}</label>
      <textarea
        className={`gf-control me-json${error ? ' me-json-error' : ''}`}
        rows={7}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const raw = draft.trim();
          if (!raw) {
            setError(false);
            onChange(undefined);
            return;
          }
          try {
            onChange(JSON.parse(raw));
            setError(false);
          } catch {
            setError(true);
          }
        }}
      />
      {error ? <p className="gf-hint me-error">JSON không hợp lệ — chưa được áp dụng.</p> : null}
      {spec.hint ? <p className="gf-hint">{spec.hint}</p> : null}
    </div>
  );
}

export function MetadataEditor({
  definition,
  value,
  onChange,
  translation = false,
  /** Layout của bản gốc — chế độ dịch dùng để lọc field theo bố cục. */
  baseLayout,
}: {
  definition?: SectionDefinition;
  value: Meta;
  onChange: (next: Meta) => void;
  translation?: boolean;
  baseLayout?: string;
}) {
  const [picker, setPicker] = useState<{ apply: (url: string) => void } | null>(null);
  const [advancedDraft, setAdvancedDraft] = useState<string | null>(null);
  const [advancedError, setAdvancedError] = useState(false);

  const setKey = (key: string, next: unknown) => {
    const draft = { ...value };
    if (next === undefined) delete draft[key];
    else draft[key] = next;
    onChange(draft);
  };

  const specs = definition?.fields ?? [];
  const layoutSpec = specs.find((spec): spec is Extract<SectionFieldSpec, { type: 'select' }> => spec.key === 'layout' && spec.type === 'select');
  const currentLayout =
    (translation ? baseLayout : typeof value.layout === 'string' ? value.layout : undefined) ??
    layoutSpec?.options[0]?.value;

  const visible = specs.filter((spec) => {
    if (spec.layouts && (!currentLayout || !spec.layouts.includes(currentLayout))) return false;
    if (translation && (spec.type === 'select' || spec.type === 'image' || spec.type === 'json')) return false;
    return true;
  });

  return (
    <div className="me-wrap">
      <div className="me-head">
        <strong>{translation ? 'Bản dịch nội dung có cấu trúc' : 'Nội dung có cấu trúc của khối'}</strong>
        <small>
          {translation
            ? 'Chỉ dịch chữ; bố cục, ảnh và mục để trống lấy theo bản gốc.'
            : definition
              ? definition.description ?? definition.label
              : 'Section thuộc danh mục sẽ có khu chỉnh sửa trực quan tại đây. Khối generic không cần metadata — chỉ dùng heading, nội dung và ảnh minh họa.'}
        </small>
      </div>

      {visible.map((spec) => {
        if (spec.type === 'select') {
          return (
            <SelectFieldEditor key={spec.key} spec={spec} value={value[spec.key]} onChange={(next) => setKey(spec.key, next)} />
          );
        }
        if (spec.type === 'stringList') {
          return (
            <StringListEditor key={spec.key} spec={spec} value={value[spec.key]} onChange={(next) => setKey(spec.key, next)} />
          );
        }
        if (spec.type === 'itemList') {
          return (
            <ItemListEditor
              key={spec.key}
              spec={spec}
              value={value[spec.key]}
              onChange={(next) => setKey(spec.key, next)}
              onPickImage={(apply) => setPicker({ apply })}
              translation={translation}
            />
          );
        }
        if (spec.type === 'textMap') {
          return <TextMapEditor key={spec.key} spec={spec} meta={value} onChange={onChange} />;
        }
        if (spec.type === 'image') {
          return (
            <ImageFieldEditor
              key={spec.key}
              spec={spec}
              value={value[spec.key]}
              onChange={(next) => setKey(spec.key, next)}
              onPickImage={(apply) => setPicker({ apply })}
            />
          );
        }
        return (
          <JsonKeyEditor key={spec.key} spec={spec} value={value[spec.key]} onChange={(next) => setKey(spec.key, next)} />
        );
      })}

      {translation ? null : (
        <details className="gf-group me-advanced">
          <summary className="gf-group-summary">
            <strong>Nâng cao — JSON đầy đủ</strong>
            <small>Dành cho dữ liệu ngoài danh mục; sửa xong bấm &ldquo;Áp dụng JSON&rdquo;.</small>
          </summary>
          <div className="gf-group-body">
            <textarea
              className={`gf-control me-json${advancedError ? ' me-json-error' : ''}`}
              rows={9}
              value={advancedDraft ?? JSON.stringify(value, null, 2)}
              onChange={(e) => setAdvancedDraft(e.target.value)}
            />
            {advancedError ? (
              <p className="gf-hint me-error">JSON không hợp lệ — chưa được áp dụng.</p>
            ) : null}
            <button
              type="button"
              className="adm-btn adm-btn--sm"
              onClick={() => {
                const raw = (advancedDraft ?? '').trim();
                if (advancedDraft === null) return;
                try {
                  const parsed: unknown = raw ? JSON.parse(raw) : {};
                  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
                  onChange(parsed as Meta);
                  setAdvancedDraft(null);
                  setAdvancedError(false);
                } catch {
                  setAdvancedError(true);
                }
              }}
            >
              Áp dụng JSON
            </button>
          </div>
        </details>
      )}

      {picker ? (
        <LibraryPicker
          open
          onClose={() => setPicker(null)}
          onSelect={(url) => {
            picker.apply(url);
            setPicker(null);
          }}
        />
      ) : null}
    </div>
  );
}

'use client';

import type { ReactNode } from 'react';
import type { SectionDefinition } from '@/app/admin/(protected)/page-sections/_lib/page-section.service';

/**
 * Chọn loại khối bằng THẺ CÓ HÌNH MINH HOẠ thay cho dropdown: mỗi component có
 * một hình vẽ bố cục (hero, slider, lưới thẻ, accordion…) + tên + mô tả, nhìn là
 * biết khối trông ra sao.
 *
 * Hình vẽ chọn theo sectionKey (SKETCH_BY_KEY); key lạ dùng hình generic.
 */

const C = { ink: '#1A2744', soft: '#8E98B0', gold: '#C9A25E', line: '#DDE3EE' };

const box = (x: number, y: number, w: number, h: number, fill: string, rx = 2) => (
  <rect key={`${x}-${y}-${w}-${h}-${fill}`} x={x} y={y} width={w} height={h} rx={rx} fill={fill} />
);

const dot = (cx: number, cy: number, r: number, fill: string) => (
  <circle key={`${cx}-${cy}-${r}-${fill}`} cx={cx} cy={cy} r={r} fill={fill} />
);

/* Mỗi hình vẽ trong khung 120×72 */
const SKETCHES: Record<string, ReactNode> = {
  hero: <>{box(8, 12, 54, 8, C.ink)}{box(8, 24, 40, 5, C.soft)}{box(8, 36, 22, 8, C.gold)}{box(8, 52, 10, 10, C.line)}{box(22, 52, 10, 10, C.line)}{box(36, 52, 10, 10, C.line)}{box(70, 8, 42, 56, C.line, 3)}</>,
  heroSlider: <>{box(8, 8, 104, 56, C.line, 3)}{box(16, 20, 44, 8, C.ink)}{box(16, 32, 34, 5, C.soft)}{box(16, 44, 20, 8, C.gold)}{dot(100, 24, 3, C.gold)}{dot(100, 34, 3, C.soft)}{dot(100, 44, 3, C.soft)}</>,
  map: <>{box(8, 8, 104, 44, C.ink, 3)}{dot(30, 28, 3, C.gold)}{dot(58, 22, 3, C.gold)}{dot(78, 32, 3, C.gold)}{dot(94, 24, 3, C.gold)}{box(24, 58, 20, 6, C.line, 3)}{box(50, 58, 20, 6, C.line, 3)}{box(76, 58, 20, 6, C.line, 3)}</>,
  mapList: <>{box(8, 10, 34, 8, C.ink)}{box(8, 22, 34, 8, C.line)}{box(8, 34, 34, 8, C.line)}{box(8, 46, 34, 8, C.line)}{box(50, 8, 62, 56, C.ink, 3)}{dot(70, 30, 3, C.gold)}{dot(88, 24, 3, C.gold)}{dot(100, 36, 3, C.gold)}</>,
  bigCards: <>{box(8, 8, 50, 26, C.ink, 4)}{box(62, 8, 50, 26, C.soft, 4)}{box(8, 38, 50, 26, C.soft, 4)}{box(62, 38, 50, 26, C.ink, 4)}{box(13, 13, 9, 4, '#FFFFFF', 2)}{box(67, 13, 9, 4, '#FFFFFF', 2)}{box(13, 43, 9, 4, '#FFFFFF', 2)}{box(67, 43, 9, 4, '#FFFFFF', 2)}{box(13, 26, 18, 4, C.gold, 2)}{box(67, 26, 18, 4, C.gold, 2)}{box(13, 56, 18, 4, C.gold, 2)}{box(67, 56, 18, 4, C.gold, 2)}</>,
  photos: <>{dot(22, 24, 12, C.line)}{dot(52, 24, 12, C.line)}{dot(82, 24, 12, C.line)}{box(12, 44, 20, 5, C.soft)}{box(42, 44, 20, 5, C.soft)}{box(72, 44, 20, 5, C.soft)}{box(20, 56, 80, 8, C.ink, 3)}</>,
  listIcon: <>{dot(18, 18, 7, C.gold)}{box(32, 14, 70, 8, C.line)}{dot(18, 38, 7, C.gold)}{box(32, 34, 70, 8, C.line)}{dot(18, 58, 7, C.gold)}{box(32, 54, 70, 8, C.line)}</>,
  slider: <>{box(8, 8, 104, 34, C.line, 3)}{dot(16, 25, 4, C.ink)}{dot(104, 25, 4, C.ink)}{box(10, 50, 18, 14, C.gold, 2)}{box(32, 50, 18, 14, C.ink, 2)}{box(54, 50, 18, 14, C.ink, 2)}{box(76, 50, 18, 14, C.ink, 2)}{box(98, 50, 14, 14, C.ink, 2)}</>,
  steps: <>{dot(20, 30, 10, C.gold)}{dot(50, 30, 10, C.line)}{dot(80, 30, 10, C.line)}{dot(106, 30, 8, C.line)}{box(30, 29, 10, 2, C.soft)}{box(60, 29, 10, 2, C.soft)}{box(90, 29, 8, 2, C.soft)}{box(12, 50, 16, 5, C.soft)}{box(42, 50, 16, 5, C.soft)}{box(72, 50, 16, 5, C.soft)}</>,
  docs: <>{box(8, 14, 34, 6, C.line)}{box(8, 30, 34, 6, C.line)}{box(8, 46, 34, 6, C.line)}{dot(60, 33, 16, C.ink)}{box(78, 14, 34, 6, C.line)}{box(78, 30, 34, 6, C.line)}{box(78, 46, 34, 6, C.line)}</>,
  marquee: <>{box(6, 20, 40, 10, C.ink, 5)}{box(52, 20, 28, 10, C.line, 5)}{box(86, 20, 30, 10, C.ink, 5)}{box(0, 42, 32, 10, C.line, 5)}{box(38, 42, 40, 10, C.ink, 5)}{box(84, 42, 30, 10, C.line, 5)}</>,
  cards: <>{box(8, 10, 32, 24, C.ink, 3)}{box(44, 10, 32, 24, C.ink, 3)}{box(80, 10, 32, 24, C.ink, 3)}{box(8, 40, 32, 24, C.ink, 3)}{box(44, 40, 32, 24, C.ink, 3)}</>,
  form: <>{box(8, 12, 44, 8, C.ink)}{box(8, 26, 36, 5, C.soft)}{box(8, 38, 30, 5, C.soft)}{box(8, 50, 30, 5, C.soft)}{box(62, 8, 50, 56, C.line, 3)}{box(68, 16, 38, 6, '#FFFFFF')}{box(68, 28, 38, 6, '#FFFFFF')}{box(68, 46, 24, 10, C.gold)}</>,
  accordionImage: <>{box(8, 8, 46, 8, C.ink)}{box(8, 22, 46, 10, C.line, 3)}{box(8, 36, 46, 10, C.line, 3)}{box(8, 50, 46, 10, C.line, 3)}{box(12, 26, 5, 2, C.gold)}{box(12, 40, 5, 2, C.gold)}{box(12, 54, 5, 2, C.gold)}{box(62, 8, 50, 56, C.ink, 4)}</>,
  accordion: <>{box(8, 10, 48, 12, C.line, 3)}{box(8, 26, 48, 12, C.line, 3)}{box(8, 42, 48, 12, C.line, 3)}{box(64, 10, 48, 12, C.line, 3)}{box(64, 26, 48, 12, C.ink, 3)}{box(64, 42, 48, 12, C.line, 3)}{box(12, 15, 6, 2, C.gold)}{box(68, 31, 6, 2, C.gold)}</>,
  strip: <>{box(8, 14, 32, 34, C.line, 3)}{box(44, 14, 32, 34, C.line, 3)}{box(80, 14, 32, 34, C.line, 3)}{box(12, 52, 24, 4, C.soft)}{box(48, 52, 24, 4, C.soft)}{box(84, 52, 24, 4, C.soft)}{box(44, 60, 32, 6, C.ink, 3)}</>,
  sizesBand: <>{box(8, 12, 104, 50, C.ink, 4)}{dot(22, 30, 7, C.gold)}{dot(44, 31, 6, C.gold)}{dot(64, 32, 5, C.gold)}{dot(82, 33, 4, C.gold)}{dot(98, 33, 3, C.gold)}{box(16, 46, 88, 1, C.gold)}{box(40, 52, 40, 3, C.gold)}</>,
  sizes: <>{dot(20, 40, 14, C.gold)}{dot(48, 42, 11, C.gold)}{dot(72, 44, 9, C.gold)}{dot(92, 45, 7, C.gold)}{dot(108, 46, 5, C.gold)}{box(8, 58, 104, 2, C.soft)}</>,
  checklist: <>{dot(14, 18, 5, C.gold)}{box(24, 15, 32, 6, C.line)}{dot(14, 36, 5, C.gold)}{box(24, 33, 32, 6, C.line)}{dot(14, 54, 5, C.gold)}{box(24, 51, 32, 6, C.line)}{dot(70, 18, 5, C.gold)}{box(80, 15, 32, 6, C.line)}{dot(70, 36, 5, C.gold)}{box(80, 33, 32, 6, C.line)}</>,
  contact: <>{dot(16, 18, 6, C.gold)}{box(28, 15, 30, 6, C.line)}{dot(16, 36, 6, C.gold)}{box(28, 33, 30, 6, C.line)}{dot(16, 54, 6, C.gold)}{box(28, 51, 30, 6, C.line)}{box(66, 8, 46, 56, C.ink, 3)}</>,
  stats: <>{box(8, 12, 60, 8, C.ink)}{box(8, 34, 24, 14, C.gold, 2)}{box(48, 34, 24, 14, C.gold, 2)}{box(88, 34, 24, 14, C.gold, 2)}{box(8, 54, 24, 4, C.soft)}{box(48, 54, 24, 4, C.soft)}{box(88, 54, 24, 4, C.soft)}</>,
  generic: <>{box(8, 12, 60, 8, C.ink)}{box(8, 28, 104, 5, C.line)}{box(8, 40, 104, 5, C.line)}{box(8, 52, 70, 5, C.line)}</>,
};

const SKETCH_BY_KEY: Record<string, keyof typeof SKETCHES> = {
  hero: 'heroSlider',
  stats: 'stats',
  'about-map': 'map',
  'media-cards': 'bigCards',
  'size-scale': 'sizesBand',
  'photo-strip': 'strip',
  'icon-card-list': 'listIcon',
  steps: 'steps',
  'feature-list': 'docs',
  marquee: 'marquee',
  'feature-cards': 'cards',
  faq: 'accordion',
  'quote-form': 'form',
  checklist: 'checklist',
  contact: 'contact',
};

function Sketch({ sectionKey }: { sectionKey: string }) {
  const kind = SKETCH_BY_KEY[sectionKey] ?? 'generic';
  return (
    <svg className="cp-sketch" viewBox="0 0 120 72" role="img" aria-hidden="true">
      <rect x="0" y="0" width="120" height="72" rx="4" fill="#FFFFFF" />
      {SKETCHES[kind]}
    </svg>
  );
}

/** Tên nhóm theo pageSlug của component; thứ tự nhóm theo GROUP_ORDER. */
const GROUP_TITLES: Record<string, string> = {
  shared: 'Thư viện component chung',
  home: 'Component của trang Home',
  products: 'Component của trang Products',
  contact: 'Component của trang Contact',
};
const GROUP_ORDER = ['shared', 'home', 'products', 'contact'];

function groupDefinitions(definitions: SectionDefinition[]) {
  const groups = new Map<string, SectionDefinition[]>();
  for (const definition of definitions) {
    const list = groups.get(definition.pageSlug) ?? [];
    list.push(definition);
    groups.set(definition.pageSlug, list);
  }
  const rank = (slug: string) => {
    const at = GROUP_ORDER.indexOf(slug);
    return at < 0 ? GROUP_ORDER.length : at;
  };
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([slug, list]) => ({
      slug,
      title: GROUP_TITLES[slug] ?? `Component của trang ${slug}`,
      definitions: list.slice().sort((a, b) => a.sortOrder - b.sortOrder),
    }));
}

/** Nhãn danh mục có tiền tố "Home · " / "Thư viện · " — bỏ khi đã lọc theo trang. */
const shortLabel = (label: string) => label.replace(/^[^·]*·\s*/, '');

export function ComponentPicker({
  definitions,
  value,
  onChange,
  genericValue,
  locked = false,
  loading = false,
}: {
  definitions: SectionDefinition[];
  value: string;
  onChange: (key: string) => void;
  /** Giá trị đại diện lựa chọn "không dùng component". */
  genericValue: string;
  /** Sửa section: kiểu khối cố định — chỉ hiện thẻ đang dùng, không bấm đổi được. */
  locked?: boolean;
  loading?: boolean;
}) {
  if (loading) return <p className="gf-hint">Đang tải danh sách component…</p>;

  if (locked) {
    const current = definitions.find((definition) => definition.sectionKey === value);
    return (
      <div className="cp-grid is-locked">
        <div className="cp-card is-active" aria-disabled="true">
          <Sketch sectionKey={current?.sectionKey ?? '__generic'} />
          <span className="cp-name">{current ? shortLabel(current.label) : 'Không dùng component'}</span>
          <span className="cp-key">{current?.sectionKey ?? 'khối generic'}</span>
        </div>
      </div>
    );
  }

  const renderCard = (definition: SectionDefinition) => {
    const active = definition.sectionKey === value;
    return (
      <button
        key={definition.sectionKey}
        type="button"
        role="radio"
        aria-checked={active}
        className={`cp-card${active ? ' is-active' : ''}`}
        onClick={() => onChange(definition.sectionKey)}
      >
        <Sketch sectionKey={definition.sectionKey} />
        <span className="cp-name">{shortLabel(definition.label)}</span>
        <span className="cp-key">{definition.sectionKey}</span>
      </button>
    );
  };

  const genericCard = (
    <button
      type="button"
      role="radio"
      aria-checked={value === genericValue}
      className={`cp-card${value === genericValue ? ' is-active' : ''}`}
      onClick={() => onChange(genericValue)}
    >
      <Sketch sectionKey="__generic" />
      <span className="cp-name">Không dùng component</span>
      <span className="cp-key">khối generic</span>
    </button>
  );

  const groups = groupDefinitions(definitions);

  // Chỉ một nguồn (VD trang Home chỉ liệt kê component của Home) → một lưới, không tiêu đề nhóm.
  if (groups.length <= 1) {
    return (
      <div className="cp-grid" role="radiogroup" aria-label="Chọn component">
        {definitions.map(renderCard)}
        {genericCard}
      </div>
    );
  }

  return (
    <div className="cp-groups" role="radiogroup" aria-label="Chọn component">
      {groups.map((group) => (
        <section className="cp-group" key={group.slug}>
          <h4 className="cp-group-title">
            {group.title} <span>{group.definitions.length}</span>
          </h4>
          <div className="cp-grid">{group.definitions.map(renderCard)}</div>
        </section>
      ))}
      <section className="cp-group">
        <h4 className="cp-group-title">Khác</h4>
        <div className="cp-grid">{genericCard}</div>
      </section>
    </div>
  );
}

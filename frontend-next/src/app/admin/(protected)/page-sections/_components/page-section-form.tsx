'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/app/admin/_components/generic-form/generic-form';
import type { GenericFormField, GenericSelectOption } from '@/app/admin/_components/generic-form/types';
import { getErrorMessage } from '@/app/admin/_lib/utils';
import { buildPayload } from '@/app/admin/_lib/crud-service';
import {
  ZH_GROUP,
  zhFields,
  zhValuesFrom,
  zhTranslationsPayload,
} from '@/app/admin/_lib/translation-fields';
import { pageService, PAGE_QUERY_KEY } from '@/app/admin/(protected)/pages/_lib/page.service';
import { ComponentPicker } from './component-picker';
import { MetadataEditor } from './metadata-editor';
import {
  fetchSectionDefinitions,
  pageSectionService,
  PAGE_SECTION_QUERY_KEY,
  SECTION_DEFINITION_QUERY_KEY,
} from '@/app/admin/(protected)/page-sections/_lib/page-section.service';
import { adminRoutes } from '@/config/routes';

/**
 * Website render section theo `metadata._component` (component = một BỐ CỤC,
 * biến thể là `metadata.layout`). Danh mục component kèm cấu trúc metadata nằm ở
 * bảng `section_definitions` (seed đồng bộ theo code); form đọc danh mục đó để:
 * (1) chọn component bằng THẺ CÓ HÌNH MINH HOẠ, (2) hiện khu chỉnh metadata
 * trực quan (kể cả bản dịch tiếng Việt của metadata).
 *
 * Section luôn gắn với MỘT trang cố định (khoá ô "Thuộc trang"):
 * - Sửa: trang của section; component + section key cũng khoá (key là id neo).
 * - Tạo: trang chọn ở bước 1 (PageSectionPagePicker → ?pageId=); mọi component
 *   dùng được ở mọi trang.
 */

const CUSTOM_KEY = '__custom';

/** Key metadata quyết định cách render — không nằm trong bản dịch. */
const STRUCTURAL_META_KEYS = ['_component', 'layout', 'showEyebrow'];

interface FormValues {
  sectionKeyCustom: string;
  heading: string;
  subheading: string;
  /** metadata.showEyebrow — hiện eyebrow dù toàn site đang ẩn. */
  showEyebrow: boolean;
  content: string;
  mediaPath: string;
  isActive: boolean;
  sortOrder: number;
  zh_heading: string;
  zh_subheading: string;
  zh_content: string;
}

const ZH_KEYS = ['heading', 'subheading', 'content'] as const;

const EMPTY: FormValues = {
  sectionKeyCustom: '',
  heading: '',
  subheading: '',
  showEyebrow: false,
  content: '',
  mediaPath: '',
  isActive: true,
  sortOrder: 1,
  zh_heading: '',
  zh_subheading: '',
  zh_content: '',
};

type Meta = Record<string, unknown>;

function translationMetaOf(translations: unknown): Meta {
  if (!translations || typeof translations !== 'object') return {};
  const vi = (translations as Record<string, unknown>).vi;
  if (!vi || typeof vi !== 'object' || Array.isArray(vi)) return {};
  const meta = (vi as Record<string, unknown>).metadata;
  return meta && typeof meta === 'object' && !Array.isArray(meta) ? { ...(meta as Meta) } : {};
}

/** Bỏ key cấu trúc + ô trống để bản dịch chỉ chứa chữ đã dịch. */
function cleanTranslationMeta(meta: Meta): Meta {
  const out: Meta = {};
  for (const [key, value] of Object.entries(meta)) {
    if (STRUCTURAL_META_KEYS.includes(key)) continue;
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

export function PageSectionForm({ id, presetPageId }: { id?: number; presetPageId?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(EMPTY);
  const [formKey, setFormKey] = useState(0);
  const [metaObj, setMetaObj] = useState<Meta>({});
  // Bản dịch tiếng Việt của metadata (translations.vi.metadata).
  const [metaViObj, setMetaViObj] = useState<Meta>({});
  // Loại component đang chọn (giữ ngoài GenericForm vì thẻ chọn là UI riêng).
  const [component, setComponent] = useState('');

  const { data: pages } = useQuery({
    queryKey: [...PAGE_QUERY_KEY, 'options'],
    queryFn: () => pageService.paginate({ limit: 1000 }),
  });

  const { data: definitions, isLoading: definitionsLoading } = useQuery({
    queryKey: SECTION_DEFINITION_QUERY_KEY,
    queryFn: fetchSectionDefinitions,
    staleTime: 5 * 60_000,
  });

  const { data } = useQuery({
    queryKey: [...PAGE_SECTION_QUERY_KEY, 'detail', id],
    queryFn: () => pageSectionService.getById(id!),
    enabled: isEdit,
  });

  // Trang cố định của form: trang của section (sửa) hoặc trang chọn ở bước 1 (tạo).
  const lockedPageId = isEdit ? data?.pageId : presetPageId;
  const lockedPage = useMemo(
    () => (pages?.data ?? []).find((p) => p.id === lockedPageId),
    [pages, lockedPageId],
  );

  // Section hiện có của trang: unique (pageId, sectionKey) nên cần biết trước
  // key nào đã dùng — nếu không, DB trả "Duplicate entry" khó hiểu.
  const { data: lockedPageDetail } = useQuery({
    queryKey: [...PAGE_QUERY_KEY, 'detail', lockedPageId],
    queryFn: () => pageService.getById(lockedPageId!),
    enabled: lockedPageId != null,
  });

  const usedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const section of lockedPageDetail?.sections ?? []) {
      if (isEdit && section.id === id) continue;
      keys.add(section.sectionKey);
    }
    return keys;
  }, [lockedPageDetail, isEdit, id]);

  /** component-key, component-key-2, component-key-3… — key trống đầu tiên. */
  const freeKeyFor = useCallback(
    (base: string) => {
      if (!usedKeys.has(base)) return base;
      let n = 2;
      while (usedKeys.has(`${base}-${n}`)) n += 1;
      return `${base}-${n}`;
    },
    [usedKeys],
  );

  const pageOptions: GenericSelectOption[] = useMemo(
    () => (pages?.data ?? []).map((p) => ({ label: `${p.title} (/${p.slug})`, value: p.id })),
    [pages],
  );

  // Mọi component dùng được ở mọi trang; xếp theo thứ tự danh mục.
  const pageDefinitions = useMemo(
    () => (definitions ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [definitions],
  );

  useEffect(() => {
    if (!data) return;
    const meta = (data.metadata as Meta | null) ?? {};
    const savedComponent = typeof meta._component === 'string' ? meta._component : null;
    const componentKey =
      savedComponent && (definitions ?? []).some((d) => d.sectionKey === savedComponent)
        ? savedComponent
        : (definitions ?? []).some((d) => d.sectionKey === data.sectionKey)
          ? data.sectionKey
          : CUSTOM_KEY;
    setMetaObj(meta);
    setMetaViObj(translationMetaOf(data.translations));
    setComponent(componentKey);
    setInitialValues({
      sectionKeyCustom: data.sectionKey ?? '',
      heading: data.heading ?? '',
      subheading: data.subheading ?? '',
      showEyebrow: meta.showEyebrow === true,
      content: data.content ?? '',
      mediaPath: data.mediaPath ?? '',
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 1,
      ...zhValuesFrom(data.translations, ZH_KEYS),
    });
    setFormKey((k) => k + 1);
  }, [data, definitions]);

  // Tạo mới: xếp khối xuống cuối trang thay vì đụng thứ tự 1 của khối đang có.
  const sortSeeded = useRef(false);
  useEffect(() => {
    if (isEdit || sortSeeded.current || !lockedPageDetail) return;
    sortSeeded.current = true;
    const last = Math.max(0, ...(lockedPageDetail.sections ?? []).map((s) => s.sortOrder ?? 0));
    setInitialValues((current) => ({ ...current, sortOrder: last + 1 }));
    setFormKey((k) => k + 1);
  }, [isEdit, lockedPageDetail]);

  const pageTitle = lockedPage?.title ?? '';
  const selectedDefinition = useMemo(
    () => (definitions ?? []).find((d) => d.sectionKey === component),
    [definitions, component],
  );
  const baseLayout = typeof metaObj.layout === 'string' ? metaObj.layout : undefined;

  const FIELDS: GenericFormField[] = useMemo(
    () => [
      {
        key: 'pageId',
        label: 'Thuộc trang',
        type: 'select',
        disabled: true,
        placeholder: 'Đang tải trang…',
        options: pageOptions,
        hint: isEdit
          ? 'Section đã gắn với trang này nên không đổi được. Muốn đưa khối sang trang khác thì tạo section mới ở trang đó.'
          : 'Trang đã chọn ở bước 1 — muốn đổi trang thì quay lại bước chọn trang.',
        // Thẻ chọn component nằm ngay dưới ô trang (UI riêng, không phải field của form).
        renderExtra: () => (
          <div className="gf-field" style={{ marginTop: 18 }}>
            <label className="gf-label">
              Component (kiểu khối) <span style={{ color: 'var(--admin-danger)' }}>*</span>
            </label>
            <p className="gf-hint" style={{ margin: '0 0 2px' }}>
              {isEdit
                ? 'Kiểu khối cố định sau khi tạo. Muốn đổi cách hiển thị thì đổi "Bố cục" trong khối bên dưới (dữ liệu giữ nguyên); muốn dùng component khác thì tạo section mới rồi tắt hoặc xoá section này.'
                : !pageTitle
                  ? 'Đang tải danh sách component…'
                  : 'Mỗi component là một bố cục, dùng được ở mọi trang. Nhiều component có thêm lựa chọn "Bố cục" bên dưới sau khi chọn.'}
            </p>
            <ComponentPicker
              definitions={pageDefinitions}
              value={component}
              onChange={(key) => {
                setComponent(key);
                // Đổi component lúc tạo → bố cục mặc định của component mới.
                const next = { ...metaObj };
                delete next.layout;
                setMetaObj(next);
              }}
              genericValue={CUSTOM_KEY}
              locked={isEdit}
              loading={definitionsLoading || !lockedPage}
            />
            {!isEdit && component && component !== CUSTOM_KEY && usedKeys.has(component) ? (
              <p className="gf-hint" style={{ marginTop: 8, color: 'var(--admin-brass-ink, var(--admin-text))' }}>
                Trang đã có khối này rồi. Vẫn dùng được lần nữa — section key sẽ tự đặt là{' '}
                <code>{freeKeyFor(component)}</code>, hoặc tự nhập key riêng ở ô dưới.
              </p>
            ) : null}
          </div>
        ),
      },
      {
        key: 'sectionKeyCustom',
        label: 'Section key (định danh trong trang)',
        type: 'text',
        disabled: isEdit,
        placeholder: 'để trống = dùng tên component — VD: slider-gioi-thieu',
        hint: isEdit
          ? 'Key cố định sau khi tạo — nó cũng là id neo trên website (VD /#request-quote), đổi sẽ làm hỏng link trong menu.'
          : 'Key phải duy nhất trong mỗi trang. Đặt tên riêng khi dùng cùng một component nhiều lần trên một trang (VD: 2 slider).',
      },
      { key: 'subheading', label: 'Eyebrow (dòng nhỏ phía trên)', type: 'text', placeholder: 'VD: Global Distribution' },
      {
        key: 'showEyebrow',
        label: 'Hiện eyebrow trên website',
        type: 'checkbox',
        hint: 'Eyebrow phía trên tiêu đề đang ẩn trên toàn site (sếp không thích subtitle). Tick để hiện riêng ở section này.',
      },
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Tiêu đề khối nội dung' },
      {
        key: 'content',
        label: 'Nội dung (đoạn giới thiệu của khối)',
        type: 'richtext',
        placeholder: 'Đoạn văn dẫn nhập hiển thị dưới tiêu đề…',
        // Khu chỉnh metadata trực quan bám theo component đang chọn.
        renderExtra: () => (
          <MetadataEditor
            definition={component === CUSTOM_KEY ? undefined : selectedDefinition}
            value={metaObj}
            onChange={setMetaObj}
          />
        ),
      },
      {
        key: 'mediaPath',
        type: 'imageUrl',
        label: 'Ảnh minh họa',
        hint: 'Ảnh hiển thị trong khối generic.',
        // Chỉ khối generic đọc ô này. Component cần ảnh thì khai báo field
        // `type: 'image'` trong section-definition.seed.ts → ô ảnh nằm ngay trong khối.
        // Ẩn chứ không xoá: giá trị cũ (nếu có) vẫn được giữ khi lưu.
        hidden: component !== CUSTOM_KEY,
      },
      { key: 'sortOrder', label: 'Thứ tự', type: 'number', rules: { min: { value: 1, message: 'Tối thiểu là 1' } } },
      { key: 'isActive', label: 'Hiển thị', type: 'checkbox', hint: 'Tắt thì khối này ẩn khỏi website (bật lại là hiện). Xoá section cũng làm khối biến mất.' },
      ...zhFields([
        { key: 'heading', label: 'Heading', type: 'text' },
        { key: 'subheading', label: 'Eyebrow', type: 'text' },
        { key: 'content', label: 'Nội dung', type: 'richtext' },
      ]).map((field) =>
        field.key === 'zh_content' && component && component !== CUSTOM_KEY
          ? {
              ...field,
              // Bản dịch của nội dung có cấu trúc (câu hỏi, thẻ, bước…) — đè theo từng key.
              renderExtra: () => (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                    <button
                      type="button"
                      className="adm-btn adm-btn--sm"
                      onClick={() => setMetaViObj(cleanTranslationMeta(structuredClone(metaObj)))}
                    >
                      Chép cấu trúc từ bản gốc để dịch
                    </button>
                  </div>
                  <MetadataEditor
                    definition={selectedDefinition}
                    value={metaViObj}
                    onChange={setMetaViObj}
                    translation
                    baseLayout={baseLayout}
                  />
                </div>
              ),
            }
          : field,
      ),
    ],
    [
      pageOptions,
      isEdit,
      pageTitle,
      pageDefinitions,
      component,
      definitionsLoading,
      lockedPage,
      selectedDefinition,
      metaObj,
      metaViObj,
      baseLayout,
      usedKeys,
      freeKeyFor,
    ],
  );

  // Tạo từ trang Page (có presetPageId) → xong / huỷ quay về trang đó.
  const backHref = !isEdit && presetPageId ? adminRoutes.pages.edit(presetPageId) : adminRoutes.pageSections.list;

  async function handleSubmit(values: FormValues) {
    if (!lockedPageId) {
      toast.error('Chưa xác định được trang của section');
      return;
    }
    if (!component) {
      toast.error('Chọn một component (kiểu khối)');
      return;
    }
    const componentKey = component === CUSTOM_KEY ? null : component;
    // Sửa: key giữ nguyên (ô bị khoá nên không gửi giá trị).
    // Tạo: trùng key trong một trang là lỗi unique dưới DB — tự né bằng hậu tố
    // số khi người dùng không tự đặt key.
    const typedKey = (values.sectionKeyCustom ?? '').trim();
    const sectionKey = isEdit
      ? (data?.sectionKey ?? '')
      : typedKey || (componentKey ? freeKeyFor(componentKey) : '');
    if (!sectionKey) {
      toast.error('Khối generic cần nhập Section key');
      return;
    }
    if (usedKeys.has(sectionKey)) {
      toast.error(`Trang này đã có section key "${sectionKey}" — đặt key khác cho khối mới.`);
      return;
    }

    // Gắn loại component vào metadata để website biết render khối nào
    // (đặc biệt khi instance key khác tên component).
    const metaOut: Meta = { ...metaObj };
    if (componentKey) metaOut._component = componentKey;
    else delete metaOut._component;
    if (values.showEyebrow) metaOut.showEyebrow = true;
    else delete metaOut.showEyebrow;

    // Bản dịch: chữ (heading/eyebrow/nội dung) + metadata đã dịch (nếu có).
    const viMeta = cleanTranslationMeta(metaViObj);
    const zh = zhTranslationsPayload(values, ZH_KEYS, data?.translations);
    let translations: Record<string, Record<string, unknown>> | null = zh;
    if (Object.keys(viMeta).length > 0) {
      translations = { vi: { ...(zh?.vi ?? {}), metadata: viMeta } };
    } else if (zh?.vi && 'metadata' in zh.vi) {
      const rest = { ...zh.vi };
      delete rest.metadata;
      translations = Object.keys(rest).length > 0 ? { vi: rest } : null;
    }

    setSubmitting(true);
    try {
      // Richtext trống thường còn '<p></p>' — coi như rỗng để xóa được nội dung.
      const emptyRichText = /^(\s*<p>\s*<\/p>\s*)*$/;
      const orNull = (raw: string) => {
        const value = raw.trim();
        return value && !emptyRichText.test(value) ? raw : null;
      };

      const payload = buildPayload(
        {
          // Ô "Thuộc trang" bị khoá (không gửi giá trị) — lấy từ trang cố định của form.
          pageId: lockedPageId,
          sectionKey,
          // Xóa trắng field = gửi null tường minh (buildPayload bỏ qua chuỗi rỗng,
          // nếu không gửi null thì backend sẽ giữ nguyên giá trị cũ).
          heading: orNull(values.heading),
          subheading: orNull(values.subheading),
          content: orNull(values.content),
          mediaPath: orNull(values.mediaPath ?? ''),
          isActive: values.isActive,
          sortOrder: Number.isFinite(values.sortOrder) ? values.sortOrder : undefined,
          metadata: Object.keys(metaOut).length > 0 ? metaOut : null,
          translations,
        },
        {
          keepNull: ['translations', 'heading', 'subheading', 'content', 'mediaPath', 'metadata'],
        },
      );

      if (isEdit) await pageSectionService.edit(id!, payload);
      else await pageSectionService.add(payload);

      await queryClient.invalidateQueries({ queryKey: PAGE_SECTION_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật section' : 'Đã tạo section');
      router.push(backHref);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={`${isEdit ? 'Sửa section' : 'Tạo section'}${pageTitle ? ` · ${pageTitle}` : ''}`}
      subtitle={
        isEdit
          ? 'Cập nhật khối nội dung của trang — website render theo component + bố cục'
          : 'Bước 2/2 — chọn component và nhập nội dung cho khối'
      }
      breadcrumbs={[
        { label: 'Section trang', link: adminRoutes.pageSections.list },
        ...(pageTitle && lockedPageId ? [{ label: pageTitle, link: adminRoutes.pages.edit(lockedPageId) }] : []),
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={FIELDS}
      groups={[ZH_GROUP]}
      defaultValues={{ ...initialValues, pageId: lockedPageId ? String(lockedPageId) : '' } as FormValues}
      loading={submitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
      onSubmit={handleSubmit}
      onCancel={() => router.push(backHref)}
    />
  );
}

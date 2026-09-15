'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { MetadataEditor } from './metadata-editor';
import {
  fetchSectionDefinitions,
  pageSectionService,
  PAGE_SECTION_QUERY_KEY,
  SECTION_DEFINITION_QUERY_KEY,
} from '@/app/admin/(protected)/page-sections/_lib/page-section.service';
import { adminRoutes } from '@/config/routes';

/**
 * Website render section THEO sectionKey — danh mục loại section (kèm cấu trúc
 * metadata của từng loại) nằm ở bảng `section_definitions`, seed đồng bộ theo
 * code. Form đọc danh mục đó để: (1) chọn loại section từ dropdown thay vì gõ
 * tay, (2) hiện khu chỉnh sửa metadata trực quan (slider, danh sách, số liệu…).
 *
 * Section luôn gắn với MỘT trang cố định (khoá ô "Thuộc trang"):
 * - Sửa: trang của section.
 * - Tạo: trang chọn ở bước 1 (PageSectionPagePicker → ?pageId=).
 * Dropdown component chỉ liệt kê component dành cho trang đó (pageSlug khớp slug
 * trang); trang tự tạo chưa có component riêng thì liệt kê Thư viện (pageSlug shared).
 */

const CUSTOM_KEY = '__custom';
const LIBRARY_SLUG = 'shared';

interface FormValues {
  pageId: string;
  sectionKey: string;
  sectionKeyCustom: string;
  heading: string;
  subheading: string;
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
  pageId: '',
  sectionKey: '',
  sectionKeyCustom: '',
  heading: '',
  subheading: '',
  content: '',
  mediaPath: '',
  isActive: true,
  sortOrder: 1,
  zh_heading: '',
  zh_subheading: '',
  zh_content: '',
};

/** Nhãn danh mục có tiền tố "Home · " / "Thư viện · " — bỏ khi đã lọc theo trang. */
const shortLabel = (label: string) => label.replace(/^[^·]*·\s*/, '');

export function PageSectionForm({ id, presetPageId }: { id?: number; presetPageId?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(() => ({
    ...EMPTY,
    pageId: presetPageId ? String(presetPageId) : '',
  }));
  const [formKey, setFormKey] = useState(0);
  const [metaObj, setMetaObj] = useState<Record<string, unknown>>({});

  const { data: pages } = useQuery({
    queryKey: [...PAGE_QUERY_KEY, 'options'],
    queryFn: () => pageService.paginate({ limit: 1000 }),
  });

  const { data: definitions } = useQuery({
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

  const pageOptions: GenericSelectOption[] = useMemo(
    () => (pages?.data ?? []).map((p) => ({ label: `${p.title} (/${p.slug})`, value: p.id })),
    [pages],
  );

  // Component đang lưu của section (khi sửa) — luôn có mặt trong dropdown.
  const savedComponentKey = useMemo(() => {
    if (!data) return null;
    const meta = (data.metadata as Record<string, unknown> | null) ?? {};
    return typeof meta._component === 'string' ? meta._component : data.sectionKey;
  }, [data]);

  const { pageDefinitions, usesLibrary } = useMemo(() => {
    const all = definitions ?? [];
    if (!lockedPage) return { pageDefinitions: [], usesLibrary: false };
    const own = all.filter((d) => d.pageSlug === lockedPage.slug);
    const list = own.length > 0 ? own : all.filter((d) => d.pageSlug === LIBRARY_SLUG);
    const saved = savedComponentKey ? all.find((d) => d.sectionKey === savedComponentKey) : undefined;
    return {
      pageDefinitions: saved && !list.includes(saved) ? [...list, saved] : list,
      usesLibrary: own.length === 0,
    };
  }, [definitions, lockedPage, savedComponentKey]);

  const keyOptions: GenericSelectOption[] = useMemo(
    () => [
      ...pageDefinitions.map((definition) => ({
        label: `${shortLabel(definition.label)} (${definition.sectionKey})`,
        value: definition.sectionKey,
      })),
      { label: 'Không dùng component — khối generic (tự nhập key)', value: CUSTOM_KEY },
    ],
    [pageDefinitions],
  );

  useEffect(() => {
    if (!data) return;
    const meta = (data.metadata as Record<string, unknown> | null) ?? {};
    const savedComponent = typeof meta._component === 'string' ? meta._component : null;
    const componentKey =
      savedComponent && (definitions ?? []).some((d) => d.sectionKey === savedComponent)
        ? savedComponent
        : (definitions ?? []).some((d) => d.sectionKey === data.sectionKey)
          ? data.sectionKey
          : CUSTOM_KEY;
    setMetaObj(meta);
    setInitialValues({
      pageId: data.pageId != null ? String(data.pageId) : '',
      sectionKey: componentKey,
      sectionKeyCustom: data.sectionKey ?? '',
      heading: data.heading ?? '',
      subheading: data.subheading ?? '',
      content: data.content ?? '',
      mediaPath: data.mediaPath ?? '',
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 1,
      ...zhValuesFrom(data.translations, ZH_KEYS),
    });
    setFormKey((k) => k + 1);
  }, [data, definitions]);

  const pageTitle = lockedPage?.title ?? '';

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
      },
      {
        key: 'sectionKey',
        label: 'Component (kiểu khối)',
        type: 'select',
        required: true,
        placeholder: 'Chọn component',
        options: keyOptions,
        hint: `${
          !pageTitle
            ? 'Đang tải danh sách component…'
            : usesLibrary
              ? `Trang "${pageTitle}" chưa có component riêng — đang liệt kê Thư viện component dùng chung.`
              : `Chỉ liệt kê component dành cho trang "${pageTitle}".`
        } Không chọn component thì khối hiển thị dạng generic (heading + nội dung + ảnh).`,
      },
      {
        key: 'sectionKeyCustom',
        label: 'Section key (định danh trong trang)',
        type: 'text',
        placeholder: 'để trống = dùng tên component — VD: slider-gioi-thieu',
        hint: 'Key phải duy nhất trong mỗi trang. Đặt tên riêng khi dùng cùng một component nhiều lần trên một trang (VD: 2 slider).',
      },
      { key: 'subheading', label: 'Eyebrow (dòng nhỏ phía trên)', type: 'text', placeholder: 'VD: Global Distribution' },
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Tiêu đề khối nội dung' },
      {
        key: 'content',
        label: 'Nội dung (đoạn giới thiệu của khối)',
        type: 'richtext',
        placeholder: 'Đoạn văn dẫn nhập hiển thị dưới tiêu đề…',
        // Khu chỉnh metadata trực quan bám theo loại section đang chọn.
        renderExtra: (values) => {
          const selected =
            values.sectionKey === CUSTOM_KEY
              ? undefined
              : (definitions ?? []).find((d) => d.sectionKey === values.sectionKey);
          return (
            <MetadataEditor definition={selected} value={metaObj} onChange={setMetaObj} />
          );
        },
      },
      { key: 'mediaPath', label: 'Ảnh minh họa', type: 'imageUrl', hint: 'Hiển thị trên trang tự tạo (khối generic). Riêng 4 trang chuẩn dùng ảnh cố định theo thiết kế / metadata.' },
      { key: 'sortOrder', label: 'Thứ tự', type: 'number', rules: { min: { value: 1, message: 'Tối thiểu là 1' } } },
      { key: 'isActive', label: 'Hiển thị', type: 'checkbox', hint: 'Tắt thì khối này ẩn khỏi website (bật lại là hiện). Xoá section cũng làm khối biến mất.' },
      ...zhFields([
        { key: 'heading', label: 'Heading', type: 'text' },
        { key: 'subheading', label: 'Eyebrow', type: 'text' },
        { key: 'content', label: 'Nội dung', type: 'richtext' },
      ]),
    ],
    [pageOptions, keyOptions, definitions, metaObj, isEdit, pageTitle, usesLibrary],
  );

  // Tạo từ trang Page (có presetPageId) → xong / huỷ quay về trang đó.
  const backHref = !isEdit && presetPageId ? adminRoutes.pages.edit(presetPageId) : adminRoutes.pageSections.list;

  async function handleSubmit(values: FormValues) {
    if (!lockedPageId) {
      toast.error('Chưa xác định được trang của section');
      return;
    }
    const component = values.sectionKey === CUSTOM_KEY ? null : values.sectionKey;
    const sectionKey = values.sectionKeyCustom.trim() || component || '';
    if (!sectionKey) {
      toast.error('Chọn component hoặc nhập section key');
      return;
    }

    // Gắn loại component vào metadata để website biết render khối nào
    // (đặc biệt khi instance key khác tên component).
    const metaOut: Record<string, unknown> = { ...metaObj };
    if (component) metaOut._component = component;
    else delete metaOut._component;

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
          mediaPath: orNull(values.mediaPath),
          isActive: values.isActive,
          sortOrder: Number.isFinite(values.sortOrder) ? values.sortOrder : undefined,
          metadata: Object.keys(metaOut).length > 0 ? metaOut : null,
          translations: zhTranslationsPayload(values, ZH_KEYS, data?.translations),
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
          ? 'Cập nhật khối nội dung của trang — website render theo loại section'
          : 'Bước 2/2 — chọn component và nhập nội dung cho khối'
      }
      breadcrumbs={[
        { label: 'Section trang', link: adminRoutes.pageSections.list },
        ...(pageTitle && lockedPageId ? [{ label: pageTitle, link: adminRoutes.pages.edit(lockedPageId) }] : []),
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={FIELDS}
      groups={[ZH_GROUP]}
      defaultValues={initialValues}
      loading={submitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
      onSubmit={handleSubmit}
      onCancel={() => router.push(backHref)}
    />
  );
}

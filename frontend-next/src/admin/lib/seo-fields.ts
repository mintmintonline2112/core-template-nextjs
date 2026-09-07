import type { GenericFormField } from '@/admin/components/generic-form/types';

export interface SeoFormValues {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  ogImagePath: string;
  canonicalUrl: string;
}

export const EMPTY_SEO: SeoFormValues = {
  slug: '',
  metaTitle: '',
  metaDescription: '',
  ogImagePath: '',
  canonicalUrl: '',
};

export const SEO_FIELDS: GenericFormField[] = [
  {
    key: 'slug',
    label: 'SEO · Slug',
    type: 'text',
    placeholder: 'Để trống để tự sinh từ tiêu đề',
    hint: 'Dạng URL, ví dụ: nieng-rang-trong-suot',
  },
  { key: 'metaTitle', label: 'SEO · Meta Title', type: 'text', placeholder: 'Thẻ <title> (mặc định: tiêu đề)' },
  { key: 'metaDescription', label: 'SEO · Meta Description', type: 'textarea', placeholder: '<meta name="description">' },
  {
    key: 'ogImagePath',
    label: 'SEO · Ảnh chia sẻ (og:image)',
    type: 'imageUrl',
    placeholder: 'Chọn từ Thư viện hoặc dán URL',
    hint: 'Ảnh hiện khi chia sẻ link trang này lên Facebook/Zalo. Trống thì dùng ảnh chia sẻ chung trong Cài đặt.',
  },
  { key: 'canonicalUrl', label: 'SEO · Canonical URL', type: 'text', placeholder: 'https://...' },
];

type SeoSource = Partial<Record<keyof SeoFormValues, string | null | undefined>>;

export function seoValuesFrom(src: SeoSource): SeoFormValues {
  return {
    slug: src.slug ?? '',
    metaTitle: src.metaTitle ?? '',
    metaDescription: src.metaDescription ?? '',
    ogImagePath: src.ogImagePath ?? '',
    canonicalUrl: src.canonicalUrl ?? '',
  };
}

/** Key SEO có thể xóa trắng — caller nhớ đưa vào keepNull của buildPayload. */
export const SEO_NULLABLE_KEYS = [
  'metaTitle',
  'metaDescription',
  'ogImagePath',
  'canonicalUrl',
] as const;

/**
 * Field SEO xóa trắng được gửi thành null tường minh để backend xóa giá trị cũ
 * (buildPayload bỏ qua chuỗi rỗng nên nếu không gửi null, giá trị cũ bị giữ lại).
 */
export function seoPayload(
  values: SeoFormValues,
): { slug: string } & Record<(typeof SEO_NULLABLE_KEYS)[number], string | null> {
  const orNull = (raw: string) => (raw.trim() ? raw : null);
  return {
    slug: values.slug,
    metaTitle: orNull(values.metaTitle),
    metaDescription: orNull(values.metaDescription),
    ogImagePath: orNull(values.ogImagePath),
    canonicalUrl: orNull(values.canonicalUrl),
  };
}

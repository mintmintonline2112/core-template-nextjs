import { PageSectionForm } from '@/app/admin/(protected)/page-sections/_components/page-section-form';
import { PageSectionPagePicker } from '@/app/admin/(protected)/page-sections/_components/page-section-page-picker';

/** Tạo section: chưa có ?pageId= → bước chọn trang; có → form với trang đã khoá. */
export default async function AdminPageSectionCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ pageId?: string }>;
}) {
  const { pageId } = await searchParams;
  const presetPageId = Number(pageId);
  if (!Number.isInteger(presetPageId) || presetPageId < 1) return <PageSectionPagePicker />;
  return <PageSectionForm key={presetPageId} presetPageId={presetPageId} />;
}

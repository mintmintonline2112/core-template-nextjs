import { notFound } from 'next/navigation';
import { PageSectionForm } from '@/admin/features/page-sections/page-section-form';

export default async function AdminPageSectionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <PageSectionForm id={numericId} />;
}

import { notFound } from 'next/navigation';
import { PageForm } from '@/app/admin/(protected)/pages/_components/page-form';

export default async function AdminPageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <PageForm id={numericId} />;
}

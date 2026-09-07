import { notFound } from 'next/navigation';
import { RoleForm } from '@/admin/features/roles/role-form';

export default async function AdminRoleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <RoleForm id={numericId} />;
}

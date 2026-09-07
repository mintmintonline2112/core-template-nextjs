import { notFound } from 'next/navigation';
import { StaffForm } from '@/admin/features/staffs/staff-form';

export default async function AdminStaffEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();
  return <StaffForm id={id} />;
}

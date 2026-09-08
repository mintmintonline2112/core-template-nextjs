import { notFound } from 'next/navigation';
import { MenuItemForm } from '@/app/admin/(protected)/menus/_components/menu-item-form';

export default async function AdminMenuEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <MenuItemForm id={numericId} />;
}

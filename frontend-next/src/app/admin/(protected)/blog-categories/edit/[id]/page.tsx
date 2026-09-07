import { notFound } from 'next/navigation';
import { BlogCategoryForm } from '@/admin/features/blog-categories/blog-category-form';

export default async function AdminBlogCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <BlogCategoryForm id={numericId} />;
}

import { notFound } from 'next/navigation';
import { BlogCategoryForm } from '@/app/admin/(protected)/blog-categories/_components/blog-category-form';

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

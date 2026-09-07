import { notFound } from 'next/navigation';
import { BlogPostForm } from '@/admin/features/blog-posts/blog-post-form';

export default async function AdminBlogPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <BlogPostForm id={numericId} />;
}

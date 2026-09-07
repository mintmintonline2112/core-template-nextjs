export type PublishStatus = "draft" | "published" | "archived";

/** Bản dịch lưu trong cột JSON `translations` — { vi: { <field>: value } }. */
export type Translations = Partial<Record<"vi", Record<string, unknown>>> | null;

export type BaseEntityFields = {
  id: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  translations?: Translations;
};

export type SeoContentFields = BaseEntityFields & {
  title: string;
  slug: string;
  status: PublishStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImagePath: string | null;
  canonicalUrl: string | null;
};

export type BlogCategory = BaseEntityFields & {
  name: string;
  slug: string;
  parentId: number | null;
  description: string | null;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImagePath: string | null;
  canonicalUrl: string | null;
};

export type BlogPost = SeoContentFields & {
  categoryId: number | null;
  category: BlogCategory | null;
  authorStaffId: string | null;
  excerpt: string | null;
  content: string;
  coverImagePath: string | null;
  /** uploads/videos/... hoặc link YouTube/Vimeo. */
  videoPath: string | null;
  videoOrientation: "landscape" | "portrait" | null;
  publishedAt: string | null;
  metadata: Record<string, unknown> | null;
};

export type PageSection = BaseEntityFields & {
  pageId: number;
  sectionKey: string;
  heading: string | null;
  subheading: string | null;
  content: string | null;
  mediaPath: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
};

export type CmsPage = SeoContentFields & {
  eyebrow: string | null;
  lead: string | null;
  templateKey: string | null;
  sections: PageSection[];
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

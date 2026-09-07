export interface DashboardPost {
  id: number;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

export interface DashboardContact {
  id: number;
  fullname: string | null;
  email: string | null;
  subject: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  content: {
    blogPosts: number;
    publishedBlogPosts: number;
    draftBlogPosts: number;
    categories: number;
    pages: number;
    publishedPages: number;
    sections: number;
  };
  contacts: {
    total: number;
    thisMonth: number;
  };
  staff: {
    total: number;
    active: number;
  };
  recentPosts: DashboardPost[];
  recentContacts: DashboardContact[];
}

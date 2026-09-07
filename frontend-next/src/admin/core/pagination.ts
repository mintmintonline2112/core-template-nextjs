export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginateParams {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  [key: string]: unknown;
}

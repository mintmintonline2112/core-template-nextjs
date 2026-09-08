export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  type: string;
  staff_code?: string;
  role?: { id: number; name: string };
  permissions?: string[];
  modules?: string[];
  avatar?: string | null;
  phone?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AdminUser;
}

export interface ApiEnvelope<T> {
  statusCode?: number;
  message?: string;
  data?: T;
}

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

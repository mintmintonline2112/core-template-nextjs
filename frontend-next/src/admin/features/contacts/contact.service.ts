import { createCrudService } from '@/admin/core/crud-service';

export const CONTACT_QUERY_KEY = ['admin', 'contacts'] as const;

export interface Contact {
  id: number;
  fullname: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  createdAt: string;
}

export const contactService = createCrudService<Contact>('admin/contacts');

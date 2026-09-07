import { extname } from 'path';

export class FileFormatter {
  private static readonly MAX_SIZE_BYTES = 4 * 1024 * 1024;
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  static isValidSize(size: number): boolean {
    return size <= this.MAX_SIZE_BYTES;
  }

  static isValidImageType(mimetype: string): boolean {
    return this.ALLOWED_MIME_TYPES.includes(mimetype);
  }

  static formatSafeName(originalName: string): string {
    const ext = extname(originalName);
    const nameWithoutExt = originalName.slice(
      0,
      originalName.length - ext.length,
    );

    const cleanName = nameWithoutExt
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    return `${cleanName || 'file'}${ext.toLowerCase()}`;
  }
}

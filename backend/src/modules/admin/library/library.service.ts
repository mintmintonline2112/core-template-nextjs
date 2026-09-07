import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { uniqueUploadName } from 'src/common/helpers/file.helper';
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  optimizeImage,
} from 'src/common/helpers/image-optimizer.helper';
import { readdir, stat, unlink, writeFile, mkdir } from 'fs/promises';
import { extname, join, relative, resolve } from 'path';
import { LibraryImage, LibraryKind, LibraryVideo } from './library.types';

/** Thư viện media: ảnh + video cùng nằm dưới uploads/, phân biệt bằng `kind` theo đuôi file. */
@Injectable()
export class LibraryService {
  private readonly uploadsRoot = resolve(process.cwd(), 'uploads');
  private readonly imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
  private readonly videoExtensions = new Set(['.mp4', '.webm', '.mov']);

  async findAll(
    baseUrl: string,
    query: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      folder?: string;
      type?: LibraryKind | 'all' | string;
    } = {},
  ): Promise<{
    data: LibraryImage[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    folders: string[];
    totalSize: number;
  }> {
    if (!existsSync(this.uploadsRoot)) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 8, totalPages: 0 },
        folders: [],
        totalSize: 0,
      };
    }

    const page = this.parsePositiveInteger(query.page, 1);
    const limit = this.parsePositiveInteger(query.limit, 8, 100);
    const search = query.search?.trim().toLowerCase();
    const folder = query.folder?.trim();
    const type = query.type === 'image' || query.type === 'video' ? query.type : 'all';

    const images = (await this.scanDirectory(this.uploadsRoot, baseUrl)).sort(
      (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime(),
    );
    const folders = Array.from(new Set(images.map((image) => image.folder || 'root'))).sort();
    const totalSize = images.reduce((sum, image) => sum + image.size, 0);

    const filteredImages = images.filter((image) => {
      if (type !== 'all' && image.kind !== type) return false;
      const matchesFolder = !folder || folder === 'all' || image.folder === folder;
      const matchesSearch =
        !search ||
        image.name.toLowerCase().includes(search) ||
        image.path.toLowerCase().includes(search) ||
        image.extension.toLowerCase().includes(search);

      return matchesFolder && matchesSearch;
    });

    const total = filteredImages.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;

    return {
      data: filteredImages.slice(start, start + limit),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
      folders,
      totalSize,
    };
  }

  /** Video đã được multer ghi ra uploads/videos — chỉ trả về path/url. */
  registerVideo(file: Express.Multer.File, baseUrl: string): LibraryVideo {
    if (!file) throw new BadRequestException('File is required');
    const path = `uploads/videos/${file.filename}`;
    return {
      name: file.filename,
      path,
      url: `${baseUrl}/${path}`,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async upload(
    file: Express.Multer.File,
    folder: string | undefined,
    baseUrl: string,
    opts: { skipOptimize?: boolean } = {},
  ): Promise<LibraryImage> {
    if (!file) throw new BadRequestException('File is required');
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(
        `File size exceeds the ${MAX_UPLOAD_MB}MB limit`,
      );
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Only jpg, png, webp, gif images are allowed');
    }

    // Sanitise folder → safe single-segment name (default "library").
    const safeFolder =
      (folder || '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'library';
    const targetDir = resolve(this.uploadsRoot, safeFolder);
    if (!targetDir.startsWith(this.uploadsRoot)) {
      throw new BadRequestException('Invalid folder');
    }
    await mkdir(targetDir, { recursive: true });

    // Nén ảnh về ~≤1MB (resize 1920px, quality thích ứng); PNG ảnh chụp → JPEG
    // (bỏ qua nếu admin đã chọn mức nén trên trình duyệt — skipOptimize)
    const optimized = opts.skipOptimize
      ? {
          buffer: file.buffer,
          ext: extname(file.originalname).toLowerCase() || '.jpg',
          mime: file.mimetype,
          changed: false,
        }
      : await optimizeImage(file.buffer, file.originalname, file.mimetype);
    // Giữ tên gốc (slug hóa) để thư viện đọc được; trùng thì thêm -2, -3...
    // (đuôi theo kết quả nén — có thể .png → .jpg)
    const baseName = file.originalname.replace(/\.[^.]+$/, '') + optimized.ext;
    const name = uniqueUploadName(baseName, (candidate) =>
      existsSync(join(targetDir, candidate)),
    );
    const ext = extname(name);
    const fullPath = join(targetDir, name);
    await writeFile(fullPath, optimized.buffer);

    const normalizedPath = `${safeFolder}/${name}`;
    const fileStat = await stat(fullPath);
    return {
      kind: 'image',
      name,
      path: `uploads/${normalizedPath}`,
      url: `${baseUrl}/uploads/${normalizedPath}`,
      folder: safeFolder,
      extension: ext.replace('.', ''),
      size: fileStat.size,
      modifiedAt: fileStat.mtime.toISOString(),
    };
  }

  async remove(filePath: string): Promise<{ deleted: boolean }> {
    const absolutePath = this.resolveUploadPath(filePath);

    if (!existsSync(absolutePath)) {
      return { deleted: false };
    }

    const fileStat = await stat(absolutePath);
    if (!fileStat.isFile()) {
      throw new BadRequestException('Path is not a file');
    }

    await unlink(absolutePath);

    return { deleted: true };
  }

  private async scanDirectory(directory: string, baseUrl: string): Promise<LibraryImage[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const images: LibraryImage[] = [];

    for (const entry of entries) {
      const absolutePath = join(directory, entry.name);

      if (entry.isDirectory()) {
        images.push(...(await this.scanDirectory(absolutePath, baseUrl)));
        continue;
      }

      if (!entry.isFile()) continue;

      const extension = extname(entry.name).toLowerCase();
      const kind: LibraryKind | null = this.imageExtensions.has(extension)
        ? 'image'
        : this.videoExtensions.has(extension)
          ? 'video'
          : null;
      if (!kind) continue;

      const fileStat = await stat(absolutePath);
      const normalizedPath = relative(this.uploadsRoot, absolutePath).replace(/\\/g, '/');
      const folder = normalizedPath.includes('/')
        ? normalizedPath.split('/').slice(0, -1).join('/')
        : 'root';

      images.push({
        kind,
        name: entry.name,
        path: `uploads/${normalizedPath}`,
        url: `${baseUrl}/uploads/${normalizedPath}`,
        folder,
        extension: extension.replace('.', ''),
        size: fileStat.size,
        modifiedAt: fileStat.mtime.toISOString(),
      });
    }

    return images;
  }

  private resolveUploadPath(filePath: string): string {
    if (!filePath) {
      throw new BadRequestException('Image path is required');
    }

    const cleanPath = filePath
      .replace(/^https?:\/\/[^/]+/i, '')
      .replace(/^\/+/, '')
      .replace(/^uploads[\\/]/, '');

    const absolutePath = resolve(this.uploadsRoot, cleanPath);
    if (!absolutePath.startsWith(this.uploadsRoot)) {
      throw new BadRequestException('Invalid image path');
    }

    return absolutePath;
  }

  private parsePositiveInteger(
    value: number | string | undefined,
    fallback: number,
    max = 1000,
  ): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return fallback;
    }
    return Math.min(parsed, max);
  }
}

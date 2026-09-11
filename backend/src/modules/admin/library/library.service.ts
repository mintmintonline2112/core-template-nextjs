import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { existsSync } from 'fs';
import { readdir, stat, unlink, writeFile, mkdir } from 'fs/promises';
import { extname, join, relative, resolve } from 'path';
import sharp from 'sharp';
import { uniqueUploadName } from 'src/common/helpers/file.helper';
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  optimizeImage,
} from 'src/common/helpers/image-optimizer.helper';
import { Media, MediaKind } from './media.entity';
import { LibraryImage, LibraryVideo, MediaUsage } from './library.types';

/** Bảng/cột có thể chứa đường dẫn file — dùng để trả lời "ảnh này đang dùng ở đâu". */
const USAGE_SOURCES: Array<{
  table: string;
  label: string;
  titleColumn: string;
  columns: string[];
}> = [
  {
    table: 'blog_posts',
    label: 'Bài viết',
    titleColumn: 'title',
    columns: [
      'cover_image_path',
      'og_image_path',
      'video_path',
      'content',
      'metadata',
      'translations',
    ],
  },
  {
    table: 'blog_categories',
    label: 'Danh mục blog',
    titleColumn: 'name',
    columns: ['og_image_path', 'translations'],
  },
  {
    table: 'pages',
    label: 'Trang',
    titleColumn: 'title',
    columns: ['og_image_path', 'translations'],
  },
  {
    table: 'page_sections',
    label: 'Page section',
    titleColumn: 'section_key',
    columns: ['media_path', 'content', 'metadata', 'translations'],
  },
  {
    table: 'site_settings',
    label: 'Cài đặt website',
    titleColumn: 'key',
    columns: ['value'],
  },
];

/**
 * Thư viện media.
 *
 * Đọc từ bảng `media` (nhanh, phân trang bằng SQL, lưu được alt text) nhưng vẫn
 * coi Ổ ĐĨA là nguồn sự thật: sync() quét uploads/ rồi thêm hàng cho file mới,
 * xoá hàng của file không còn, cập nhật hàng có file đã đổi. Nhờ vậy vẫn giữ
 * được ưu điểm cũ "kéo file vào bằng FTP là thấy", chỉ khác là cần bấm Quét lại.
 */
@Injectable()
export class LibraryService implements OnModuleInit {
  private readonly logger = new Logger(LibraryService.name);
  private readonly uploadsRoot = resolve(process.cwd(), 'uploads');
  private readonly imageExtensions = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
  ]);
  private readonly videoExtensions = new Set(['.mp4', '.webm', '.mov']);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    private readonly dataSource: DataSource,
  ) {
    // Tắt cache của libvips: nó giữ file handle sau khi đọc kích thước ảnh,
    // khiến xoá file ngay sau đó bị EBUSY trên Windows (máy dev). Linux không
    // dính, nhưng tắt đi thì hành vi giống nhau ở mọi nơi.
    sharp.cache(false);
  }

  /** Đồng bộ một lần lúc khởi động để bảng khớp ổ đĩa ngay từ đầu. */
  async onModuleInit(): Promise<void> {
    try {
      const result = await this.sync();
      if (result.added || result.removed || result.updated) {
        this.logger.log(
          `Đồng bộ thư viện: +${result.added} / -${result.removed} / ~${result.updated}`,
        );
      }
    } catch (error) {
      // Không được chặn app khởi động chỉ vì thư viện lệch.
      this.logger.warn(`Bỏ qua đồng bộ thư viện lúc khởi động: ${error}`);
    }
  }

  // ----------------------------------------------------------- Đọc danh sách

  async findAll(
    baseUrl: string,
    query: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      folder?: string;
      type?: MediaKind | 'all' | string;
    } = {},
  ): Promise<{
    data: LibraryImage[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    folders: string[];
    totalSize: number;
  }> {
    const page = this.parsePositiveInteger(query.page, 1);
    const limit = this.parsePositiveInteger(query.limit, 24, 100);
    const search = query.search?.trim();
    const folder = query.folder?.trim();
    const type =
      query.type === 'image' || query.type === 'video' ? query.type : 'all';

    const qb = this.mediaRepo.createQueryBuilder('m');
    if (type !== 'all') qb.andWhere('m.kind = :kind', { kind: type });
    if (folder && folder !== 'all') qb.andWhere('m.folder = :folder', { folder });
    if (search) {
      qb.andWhere('(m.name LIKE :s OR m.path LIKE :s OR m.alt LIKE :s)', {
        s: `%${search}%`,
      });
    }

    const [rows, total] = await qb
      .orderBy('m.modifiedAt', 'DESC')
      .addOrderBy('m.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Danh sách thư mục + tổng dung lượng tính trên TOÀN bộ thư viện,
    // không phụ thuộc bộ lọc đang chọn (giống hành vi cũ).
    const [folderRows, totals] = await Promise.all([
      this.mediaRepo
        .createQueryBuilder('m')
        .select('DISTINCT m.folder', 'folder')
        .orderBy('folder', 'ASC')
        .getRawMany<{ folder: string }>(),
      this.mediaRepo
        .createQueryBuilder('m')
        .select('COALESCE(SUM(m.size), 0)', 'sum')
        .getRawOne<{ sum: string }>(),
    ]);

    return {
      data: rows.map((row) => this.toLibraryImage(row, baseUrl)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      folders: folderRows.map((r) => r.folder),
      totalSize: Number(totals?.sum ?? 0),
    };
  }

  // ------------------------------------------------------------------ Đồng bộ

  /** Quét uploads/ rồi chỉnh bảng cho khớp. Trả về số hàng thêm/xoá/cập nhật. */
  async sync(): Promise<{ added: number; removed: number; updated: number }> {
    if (!existsSync(this.uploadsRoot)) {
      const removed = await this.mediaRepo.count();
      if (removed) await this.mediaRepo.clear();
      return { added: 0, removed, updated: 0 };
    }

    const onDisk = await this.scanDirectory(this.uploadsRoot);
    const byPath = new Map(onDisk.map((file) => [file.path, file]));
    const existing = await this.mediaRepo.find();
    const existingByPath = new Map(existing.map((row) => [row.path, row]));

    let added = 0;
    let removed = 0;
    let updated = 0;

    // File có trên ổ nhưng chưa có hàng → thêm
    const toInsert: Media[] = [];
    for (const [path, file] of byPath) {
      const row = existingByPath.get(path);
      if (!row) {
        toInsert.push(
          this.mediaRepo.create({
            ...file,
            ...(await this.readDimensions(file)),
          }),
        );
        added += 1;
        continue;
      }
      // File bị ghi đè (đổi dung lượng hoặc mtime) → cập nhật, GIỮ NGUYÊN alt
      const changed =
        row.size !== file.size ||
        row.modifiedAt?.getTime() !== file.modifiedAt.getTime();
      if (changed) {
        Object.assign(row, file, await this.readDimensions(file));
        await this.mediaRepo.save(row);
        updated += 1;
      }
    }
    if (toInsert.length) await this.mediaRepo.save(toInsert, { chunk: 200 });

    // Hàng còn trong bảng nhưng file đã biến mất → xoá hàng
    const orphanIds = existing
      .filter((row) => !byPath.has(row.path))
      .map((row) => row.id);
    if (orphanIds.length) {
      await this.mediaRepo.delete({ id: In(orphanIds) });
      removed = orphanIds.length;
    }

    return { added, removed, updated };
  }

  // -------------------------------------------------------------------- Ghi

  async upload(
    file: Express.Multer.File,
    folder: string | undefined,
    baseUrl: string,
    opts: { skipOptimize?: boolean; staffId?: string } = {},
  ): Promise<LibraryImage> {
    if (!file) throw new BadRequestException('File is required');
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(
        `File size exceeds the ${MAX_UPLOAD_MB}MB limit`,
      );
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only jpg, png, webp, gif images are allowed',
      );
    }

    const safeFolder =
      (folder || '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'library';
    const targetDir = resolve(this.uploadsRoot, safeFolder);
    if (!targetDir.startsWith(this.uploadsRoot)) {
      throw new BadRequestException('Invalid folder');
    }
    await mkdir(targetDir, { recursive: true });

    // Nén ảnh về ~≤1MB; bỏ qua nếu admin đã tự chọn mức nén trên trình duyệt.
    const optimized = opts.skipOptimize
      ? {
          buffer: file.buffer,
          ext: extname(file.originalname).toLowerCase() || '.jpg',
          mime: file.mimetype,
          changed: false,
        }
      : await optimizeImage(file.buffer, file.originalname, file.mimetype);

    const baseName =
      file.originalname.replace(/\.[^.]+$/, '') + optimized.ext;
    const name = uniqueUploadName(baseName, (candidate) =>
      existsSync(join(targetDir, candidate)),
    );
    const fullPath = join(targetDir, name);
    await writeFile(fullPath, optimized.buffer);

    const fileStat = await stat(fullPath);
    const path = `uploads/${safeFolder}/${name}`;
    const dimensions = await this.probeDimensions(fullPath);

    const row = await this.mediaRepo.save(
      this.mediaRepo.create({
        path,
        name,
        folder: safeFolder,
        kind: 'image',
        extension: extname(name).replace('.', ''),
        mimeType: optimized.mime ?? file.mimetype,
        size: fileStat.size,
        modifiedAt: fileStat.mtime,
        uploadedByStaffId: opts.staffId ?? null,
        ...dimensions,
      }),
    );

    return this.toLibraryImage(row, baseUrl);
  }

  /** Video đã được multer ghi thẳng ra uploads/videos — chỉ cần thêm hàng. */
  async registerVideo(
    file: Express.Multer.File,
    baseUrl: string,
    staffId?: string,
  ): Promise<LibraryVideo> {
    if (!file) throw new BadRequestException('File is required');
    const path = `uploads/videos/${file.filename}`;
    const fullPath = resolve(this.uploadsRoot, 'videos', file.filename);
    const fileStat = existsSync(fullPath) ? await stat(fullPath) : null;

    await this.mediaRepo.save(
      this.mediaRepo.create({
        path,
        name: file.filename,
        folder: 'videos',
        kind: 'video',
        extension: extname(file.filename).replace('.', ''),
        mimeType: file.mimetype,
        size: fileStat?.size ?? file.size,
        modifiedAt: fileStat?.mtime ?? new Date(),
        uploadedByStaffId: staffId ?? null,
      }),
    );

    return {
      name: file.filename,
      path,
      url: `${baseUrl}/${path}`,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /** Sửa mô tả ảnh (alt). */
  async updateAlt(id: number, alt: string | null): Promise<Media> {
    const row = await this.mediaRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Không tìm thấy file trong thư viện');
    row.alt = alt?.trim() ? alt.trim().slice(0, 300) : null;
    return this.mediaRepo.save(row);
  }

  async remove(filePath: string): Promise<{ deleted: boolean }> {
    const absolutePath = this.resolveUploadPath(filePath);
    const normalized = this.normalizePath(filePath);

    await this.mediaRepo.delete({ path: normalized });

    if (!existsSync(absolutePath)) return { deleted: false };
    const fileStat = await stat(absolutePath);
    if (!fileStat.isFile()) throw new BadRequestException('Path is not a file');
    await unlink(absolutePath);

    return { deleted: true };
  }

  // ------------------------------------------------- Ảnh đang dùng ở chỗ nào

  /**
   * Dò các bảng nội dung xem đường dẫn này còn được tham chiếu không.
   * Dùng LIKE trên cả cột text lẫn cột JSON — đủ dùng vì đường dẫn là duy nhất
   * và không có ràng buộc khoá ngoại nào để dựa vào.
   */
  async usage(filePath: string): Promise<MediaUsage[]> {
    const normalized = this.normalizePath(filePath);
    if (!normalized) return [];
    // Bỏ tiền tố uploads/ để bắt được cả link tuyệt đối lẫn tương đối trong nội dung.
    const needle = normalized.replace(/^uploads\//, '');
    const found: MediaUsage[] = [];

    for (const source of USAGE_SOURCES) {
      const where = source.columns
        .map((column) => `\`${column}\` LIKE :needle`)
        .join(' OR ');
      try {
        const rows: Array<Record<string, unknown>> = await this.dataSource.query(
          `SELECT \`${source.titleColumn}\` AS title FROM \`${source.table}\` WHERE ${where} LIMIT 20`.replace(
            /:needle/g,
            '?',
          ),
          source.columns.map(() => `%${needle}%`),
        );
        for (const row of rows) {
          const title = String(row.title ?? '(không tên)');
          // Cùng một bản ghi có thể khớp ở nhiều cột → gộp lại, đếm số lần.
          const seen = found.find(
            (f) => f.type === source.label && f.title === title,
          );
          if (seen) seen.count += 1;
          else found.push({ type: source.label, title, count: 1 });
        }
      } catch (error) {
        // Bảng/cột có thể khác nhau giữa các bản DB — bỏ qua nguồn lỗi,
        // thà thiếu một nguồn còn hơn chặn thao tác xoá.
        this.logger.warn(`Bỏ qua kiểm tra ${source.table}: ${error}`);
      }
    }

    return found;
  }

  // ------------------------------------------------------------------ Nội bộ

  private toLibraryImage(row: Media, baseUrl: string): LibraryImage {
    return {
      id: row.id,
      kind: row.kind,
      name: row.name,
      path: row.path,
      url: `${baseUrl}/${row.path}`,
      folder: row.folder,
      extension: row.extension,
      size: row.size,
      width: row.width,
      height: row.height,
      alt: row.alt,
      modifiedAt: (row.modifiedAt ?? row.createdAt).toISOString(),
    };
  }

  private async readDimensions(
    file: Pick<Media, 'kind'> & { path: string },
  ): Promise<{ width: number | null; height: number | null }> {
    if (file.kind !== 'image') return { width: null, height: null };
    return this.probeDimensions(resolve(process.cwd(), file.path));
  }

  private async probeDimensions(
    absolutePath: string,
  ): Promise<{ width: number | null; height: number | null }> {
    try {
      const meta = await sharp(absolutePath).metadata();
      return { width: meta.width ?? null, height: meta.height ?? null };
    } catch {
      // Ảnh hỏng hoặc định dạng sharp không đọc được — vẫn liệt kê, chỉ thiếu kích thước.
      return { width: null, height: null };
    }
  }

  /** Quét đệ quy uploads/, trả về thông tin thô của từng file nhận diện được. */
  private async scanDirectory(directory: string): Promise<
    Array<{
      path: string;
      name: string;
      folder: string;
      kind: MediaKind;
      extension: string;
      size: number;
      modifiedAt: Date;
    }>
  > {
    const entries = await readdir(directory, { withFileTypes: true });
    const files: Array<{
      path: string;
      name: string;
      folder: string;
      kind: MediaKind;
      extension: string;
      size: number;
      modifiedAt: Date;
    }> = [];

    for (const entry of entries) {
      const absolutePath = join(directory, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await this.scanDirectory(absolutePath)));
        continue;
      }
      if (!entry.isFile()) continue;

      const extension = extname(entry.name).toLowerCase();
      const kind: MediaKind | null = this.imageExtensions.has(extension)
        ? 'image'
        : this.videoExtensions.has(extension)
          ? 'video'
          : null;
      if (!kind) continue;

      const fileStat = await stat(absolutePath);
      const normalizedPath = relative(this.uploadsRoot, absolutePath).replace(
        /\\/g,
        '/',
      );
      const folder = normalizedPath.includes('/')
        ? normalizedPath.split('/').slice(0, -1).join('/')
        : 'root';

      files.push({
        path: `uploads/${normalizedPath}`,
        name: entry.name,
        folder,
        kind,
        extension: extension.replace('.', ''),
        size: fileStat.size,
        modifiedAt: fileStat.mtime,
      });
    }

    return files;
  }

  /** Chuẩn hoá mọi kiểu đường dẫn về dạng `uploads/thu-muc/ten-file`. */
  private normalizePath(filePath: string): string {
    if (!filePath) return '';
    const clean = filePath
      .replace(/^https?:\/\/[^/]+/i, '')
      .replace(/^\/+/, '')
      .replace(/^uploads[\\/]/, '');
    return `uploads/${clean.replace(/\\/g, '/')}`;
  }

  private resolveUploadPath(filePath: string): string {
    if (!filePath) throw new BadRequestException('Image path is required');
    const relativePath = this.normalizePath(filePath).replace(/^uploads\//, '');
    const absolutePath = resolve(this.uploadsRoot, relativePath);
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
    if (!Number.isInteger(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, max);
  }
}

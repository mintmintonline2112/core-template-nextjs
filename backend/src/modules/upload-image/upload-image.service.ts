import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { mkdirSync, existsSync, unlinkSync } from 'fs';
import { join, resolve, sep } from 'path';
import {
  detectImageKind,
  MIME_BY_IMAGE_KIND,
  uniqueUploadName,
} from 'src/common/helpers/file.helper';
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  optimizeImage,
} from 'src/common/helpers/image-optimizer.helper';

export class FileSizeLimitException extends BadRequestException {
  constructor() {
    super(`File size exceeds the ${MAX_UPLOAD_MB}MB limit`);
  }
}

export class FileTypeException extends BadRequestException {
  constructor() {
    super('Chỉ chấp nhận ảnh jpg, png, webp hoặc gif');
  }
}

export class FileStorageException extends InternalServerErrorException {
  constructor() {
    super('Could not handle file operation on disk');
  }
}

@Injectable()
export class UploadImageService {
  private readonly ROOT_PATH = 'uploads';

  /**
   * Upload a single image file to the server with validation and unique naming
   */
  async upload(
    file: Express.Multer.File,
    subFolder: string,
    opts: { skipOptimize?: boolean } = {},
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new FileSizeLimitException();
    }

    // Kiểm nội dung thật của file, không tin mimetype do client khai.
    const kind = detectImageKind(file.buffer);
    if (!kind) {
      throw new FileTypeException();
    }

    const targetDir = join(process.cwd(), this.ROOT_PATH, subFolder);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Nén ảnh về ~≤1MB rồi mới lưu (đuôi có thể đổi .png → .jpg)
    // (bỏ qua nếu admin đã chọn mức nén trên trình duyệt — skipOptimize)
    // Đuôi luôn lấy theo loại ảnh đã nhận dạng, không lấy theo tên người dùng đặt.
    const safeName = file.originalname.replace(/\.[^.]+$/, '') + kind;

    const optimized = opts.skipOptimize
      ? {
          buffer: file.buffer,
          ext: kind,
          mime: MIME_BY_IMAGE_KIND[kind],
          changed: false,
        }
      : await optimizeImage(file.buffer, safeName, MIME_BY_IMAGE_KIND[kind]);
    // Giữ tên gốc (slug hóa) thay vì timestamp; trùng thì thêm -2, -3...
    const baseName = file.originalname.replace(/\.[^.]+$/, '') + optimized.ext;
    const uniqueFileName = uniqueUploadName(baseName, (candidate) =>
      existsSync(join(targetDir, candidate)),
    );

    const fullPath = join(targetDir, uniqueFileName);

    try {
      await writeFile(fullPath, optimized.buffer);
    } catch (err) {
      throw new FileStorageException();
    }

    return join(this.ROOT_PATH, subFolder, uniqueFileName).replace(/\\/g, '/');
  }

  /**
   * Delete a file from the server safely by validating its path
   */
  deleteFile(filePath: string): void {
    try {
      if (!filePath) return;

      let cleanPath = filePath;

      if (cleanPath.startsWith('http')) {
        cleanPath = new URL(cleanPath).pathname;
      }

      cleanPath = cleanPath.replace(/^\/+/, '');

      if (!cleanPath.startsWith(this.ROOT_PATH)) return;

      // So khớp sau khi resolve: chuỗi "uploads/../../ngoai-vung" vẫn bắt đầu
      // bằng "uploads" nhưng trỏ ra ngoài thư mục upload.
      const uploadRoot = resolve(process.cwd(), this.ROOT_PATH);
      const absolutePath = resolve(process.cwd(), cleanPath);

      if (absolutePath !== uploadRoot && !absolutePath.startsWith(uploadRoot + sep)) {
        return;
      }

      if (existsSync(absolutePath)) {
        unlinkSync(absolutePath);
      }
    } catch (err) {
      console.error('Delete file failed:', err);
    }
  }
}

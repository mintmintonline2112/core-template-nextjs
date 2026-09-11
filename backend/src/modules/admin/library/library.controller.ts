import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  SetMetadata,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { uniqueUploadName } from 'src/common/helpers/file.helper';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guard/admin/permission.guard';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';
import { LibraryService } from './library.service';

const VIDEO_DIR = resolve(process.cwd(), 'uploads', 'videos');
const VIDEO_MAX_MB = 200;
const VIDEO_MIMES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

/** Video ghi thẳng ra đĩa (không qua RAM như ảnh) — file tới 200MB. */
const videoStorage = diskStorage({
  destination: (_req, _file, cb) => {
    mkdirSync(VIDEO_DIR, { recursive: true });
    cb(null, VIDEO_DIR);
  },
  filename: (_req, file, cb) => {
    cb(
      null,
      uniqueUploadName(file.originalname, (candidate) =>
        existsSync(resolve(VIDEO_DIR, candidate)),
      ),
    );
  },
});

@ApiTags('Admin - Library')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'LIBRARY')
@Controller('admin/library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  @Permissions('LIST')
  @ApiOperation({ summary: 'List uploaded images' })
  async findAll(@Req() request: Request, @Query() query: any) {
    const protocol = request.protocol;
    const host = request.get('host');
    return this.libraryService.findAll(`${protocol}://${host}`, query);
  }

  @Post('upload')
  @Permissions('CREATE')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new image to the library' })
  async upload(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('imageOptimize') imageOptimize?: string,
  ) {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    // 'skip' = admin đã xem/chọn mức nén trên trình duyệt → tôn trọng, không nén đè
    return this.libraryService.upload(file, folder, baseUrl, {
      skipOptimize: imageOptimize === 'skip',
    });
  }

  @Post('upload-video')
  @Permissions('CREATE')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: videoStorage,
      limits: { fileSize: VIDEO_MAX_MB * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (VIDEO_MIMES.has(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Chỉ nhận video MP4, WebM hoặc MOV'), false);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a video (mp4/webm/mov, max 200MB)' })
  async uploadVideo(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    return this.libraryService.registerVideo(file, baseUrl);
  }

  @Delete()
  @Permissions('DELETE')
  @ApiOperation({ summary: 'Delete an uploaded image by path' })
  async remove(@Query('path') path: string) {
    return this.libraryService.remove(path);
  }
}

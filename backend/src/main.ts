import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ServerConfig } from './config/server.config';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  const configService = app.get(ConfigService);
  const serverConfig = configService.get<ServerConfig>('server');

  if (!serverConfig) {
    throw new Error('Server configuration not found');
  }
app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  const allowedOrigins = serverConfig.frontendUrl
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  const isDev = process.env.NODE_ENV !== 'production';

  /**
   * Chỉ chấp nhận origin có trong FRONTEND_URL. Ở môi trường dev thì mở thêm
   * localhost/127.0.0.1 với cổng bất kỳ.
   *
   * Trước đây điều kiện là `origin.includes('localhost')` — bất kỳ tên miền nào
   * CHỨA chuỗi đó (vd. https://localhost.ke-tan-cong.com) đều lọt qua, mà API
   * lại bật `credentials: true` nên trang của kẻ tấn công đọc được dữ liệu của
   * phiên đăng nhập nạn nhân.
   */
  const isLocalOrigin = (origin: string): boolean => {
    try {
      const { hostname } = new URL(origin);
      return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
    } catch {
      return false;
    }
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || (isDev && isLocalOrigin(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // File do người dùng tải lên: cấm trình duyệt tự đoán kiểu nội dung và cấm
  // nhúng trong iframe — chặn đường khai thác XSS lưu trữ qua file lạ.
  const uploadHeaders = (res: import('express').Response) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    res.setHeader('X-Frame-Options', 'DENY');
  };

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    setHeaders: uploadHeaders,
  });

  app.useStaticAssets(join(__dirname, '..', 'src/assets'), {
    prefix: '/assets/',
    setHeaders: uploadHeaders,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // coerce types per @Type (e.g. "5" -> 5)
      whitelist: true, // strip properties not declared in the DTO
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  // Swagger phơi bày toàn bộ endpoint quản trị kèm cấu trúc DTO, nên chỉ mở khi
  // chạy dev. Cần xem trên server thật thì đặt SWAGGER_ENABLED=true.
  const swaggerEnabled = isDev || process.env.SWAGGER_ENABLED === 'true';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Prime Nuts USA API')
      .setDescription(
        'CMS & API for the Prime Nuts USA website — pages, blog, contacts, B2B quote requests',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(serverConfig.port);

  console.log(
    swaggerEnabled
      ? `🚀 API sẵn sàng — Swagger tại http://localhost:${serverConfig.port}/docs`
      : `🚀 API sẵn sàng tại cổng ${serverConfig.port} (Swagger đang tắt)`,
  );
}

void bootstrap();

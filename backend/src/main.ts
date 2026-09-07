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
    .map((url) => url.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS ',
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.useStaticAssets(join(__dirname, '..', 'src/assets'), {
    prefix: '/assets/',
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

  await app.listen(serverConfig.port);

  console.log(
    `🚀 Swagger running at http://localhost:${serverConfig.port}/docs`,
  );
}

void bootstrap();

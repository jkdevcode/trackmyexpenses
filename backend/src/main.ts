import { NestFactory } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe, cleanupOpenApiDoc } from 'nestjs-zod';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const port = configService.get<number>('PORT', 3000);
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const csrfOriginCheckEnabled = configService.get<boolean>(
    'CSRF_ORIGIN_CHECK_ENABLED',
    nodeEnv === 'production',
  );
  const allowedOrigins = corsOrigin
    ? corsOrigin.split(',').map((origin) => origin.trim())
    : [];

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((origin) => origin.trim())
      : true,
    credentials: true,
  });
  app.use(cookieParser());

  if (csrfOriginCheckEnabled && allowedOrigins.length > 0) {
    app.use((req: Request, _: Response, next: NextFunction) => {
      const method = req.method.toUpperCase();
      const isSafeMethod =
        method === 'GET' ||
        method === 'HEAD' ||
        method === 'OPTIONS' ||
        method === 'TRACE';
      if (isSafeMethod) {
        return next();
      }

      const hasAuthCookie =
        typeof req.cookies?.token === 'string' ||
        req.headers.cookie?.includes('token=');
      if (!hasAuthCookie) {
        return next();
      }

      const source = req.headers.origin ?? req.headers.referer;
      const isAllowedOrigin =
        typeof source === 'string' &&
        allowedOrigins.some((origin) => source.startsWith(origin));
      if (!isAllowedOrigin) {
        return next(new ForbiddenException('CSRF origin validation failed'));
      }

      return next();
    });
  }

  app.useGlobalPipes(new ZodValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('API Auth')
    .setDescription('Backend escalable con Zod')
    .setVersion('1.0')
    .addCookieAuth('token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'token',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  cleanupOpenApiDoc(document);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  logger.log({ msg: 'Application started', url: await app.getUrl() });
}
void bootstrap();

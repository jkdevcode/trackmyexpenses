import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FacturaModule } from './factura/factura.module';
import { ProductoModule } from './producto/producto.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('NODE_ENV', 'development');
        const level = configService.get<string>(
          'LOG_LEVEL',
          env === 'production' ? 'info' : 'debug',
        );

        return {
          pinoHttp: {
            level,
            autoLogging: false,
            redact: ['req.headers.authorization'],
            genReqId: (req) => {
              const requestIdHeader = req.headers['x-request-id'];
              if (
                typeof requestIdHeader === 'string' &&
                requestIdHeader.trim() !== ''
              ) {
                return requestIdHeader;
              }
              return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            },
          },
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const ttl = Number(configService.get<string>('CACHE_TTL_MS', '600000'));

        if (!redisUrl) {
          return { ttl, stores: [] };
        }

        return {
          ttl,
          stores: [createKeyv(redisUrl)],
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ttlSeconds = Number(
          configService.get<string>('THROTTLE_TTL', '60'),
        );
        const limit = Number(
          configService.get<string>('THROTTLE_LIMIT', '120'),
        );

        return [
          {
            ttl: ttlSeconds * 1000,
            limit,
          },
        ];
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
      exclude: ['/api/(.*)'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UserModule,
    FacturaModule,
    ProductoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

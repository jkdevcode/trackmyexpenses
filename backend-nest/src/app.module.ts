import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static'; 
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FacturaModule } from './factura/factura.module';
import { ProductoModule } from './producto/producto.module';
import { FacturaOcrModule } from './factura-ocr/factura-ocr.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      // Subimos dos niveles para salir de 'dist/src' y llegar a la raíz del proyecto
      rootPath: join(__dirname, '..', '..', 'uploads'), 
      serveRoot: '/uploads',
      exclude: ['/api/(.*)'], // Asegura que no interfiera con tu API
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UserModule,
    FacturaModule,
    ProductoModule,
    FacturaOcrModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe, cleanupOpenApiDoc } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  
  app.setGlobalPrefix('api');
  app.enableCors();

  // Pipe global para que NO tengas que poner @UsePipes en cada controlador
  app.useGlobalPipes(new ZodValidationPipe());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Auth')
    .setDescription('Backend escalable con Zod')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // LA CLAVE: Limpiar el documento antes de configurarlo
  cleanupOpenApiDoc(document); 
  
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

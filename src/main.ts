import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 👈 1. Importación esencial
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma/prisma-client-exception.filter';

async function bootstrap() {
  if (existsSync('.env')) loadEnvFile();
  
  mkdirSync(join(process.cwd(), 'uploads', 'usuarios'), { recursive: true });

  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.enableShutdownHooks();
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapterHost));

  // 👈 2. Configuración de Swagger para Entidades
  const config = new DocumentBuilder()
    .setTitle('CliniCore - MS Entidades y Configuración')
    .setDescription('Endpoints globales para la gestión de usuarios, sucursales, roles y entidades del sistema')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 🎯 Exponer la documentación y el JSON crudo en la ruta de entidades
  SwaggerModule.setup('api/v1/usuarios/docs', app, document, {
    swaggerOptions: {
      jsonEditor: true, 
    }
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(`MS Entidades corriendo en puerto ${process.env.PORT ?? 3000}`);
}

void bootstrap();
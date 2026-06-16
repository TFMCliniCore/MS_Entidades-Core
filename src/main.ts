import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
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

  //const port = Number(process.env.PORT ?? 3001);
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

void bootstrap();

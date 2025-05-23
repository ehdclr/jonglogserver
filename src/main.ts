import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // 요청 크기 제한 설정
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());
  app.enableCors({
    origin: true, // 또는 '*' 대신 true 사용
    credentials: true,
  });

  const port = configService.get<string>('PORT') ?? '8080';
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}

bootstrap().catch((error: Error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});

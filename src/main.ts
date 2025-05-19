import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // 요청 크기 제한 설정
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: 'http://localhost:3000', // 프론트엔드 주소로 명확히 지정
    credentials: true, // 쿠키 등 인증정보 허용
  });

  const port = configService.get<string>('PORT') ?? '8080';
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}

bootstrap().catch((error: Error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});

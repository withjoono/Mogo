import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie Parser 설정 (HttpOnly Cookie 지원)
  app.use(cookieParser());

  // CORS 설정 - Mogo(모의) 포트: 3009 (프론트엔드), 4009 (백엔드)
  const allowedOrigins = [
    // Mogo 프론트엔드
    'http://localhost:3009',
    // T스쿨 Hub (SSO 연동용)
    'http://localhost:3000',
    // Firebase Hosting
    'https://mogo-app.web.app',
    'https://mogo-app.firebaseapp.com',
    // Production domains
    'https://mogo.tskool.kr',
    'https://www.mogo.tskool.kr',
    // T스쿨 Hub
    'https://tskool.kr',
    'https://www.tskool.kr',
  ];

  // 환경 변수로 추가 origin 허용
  if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validation Pipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Mogo API')
    .setDescription('모의(Mogo) 모의고사 분석 서비스 API | T스쿨')
    .setVersion('1.0')
    .addTag('Health', 'Health check endpoints')
    .addTag('모의고사', '모의고사 관련 API')
    .addTag('점수', '점수 입력/조회 API')
    .addTag('대학', '대학/학과 조회 API')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Mogo 백엔드 포트: Cloud Run/App Engine은 PORT 환경변수 사용, 로컬은 4009
  const port = parseInt(process.env.PORT || '4009', 10);

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Mogo Backend is running on port ${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
}

void bootstrap();

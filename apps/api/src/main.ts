import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('NWIS-API-Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend web application
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global exception filter for standardized error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('NWIS — Nearby Wells Intelligence System')
    .setDescription(
      'Stage 01 Foundation REST API for Oil India Limited (OIL). Provides well spatial radius queries, geological depth correlation, historical precedent events retrieval, and synthetic data ingestion pipeline.'
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`NWIS REST API is running on: http://localhost:${port}`);
  logger.log(`Interactive OpenAPI Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

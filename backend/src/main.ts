import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerService } from './logger/logger.service';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api/v1'));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('K-shap Backend API')
    .setDescription(
      'Comprehensive API documentation for the K-shap backend system',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = configService.get('PORT', 4000);
  await app.listen(port);

  // Get the mongoose connection to log when it's ready
  // Access the connection through the MongooseModule
  try {
    const connection = app.get(getConnectionToken());
    connection.once('open', () => {
      logger.log(`✅ MongoDB connected and running`, 'Database');
    });

    connection.on('error', (err) => {
      logger.error(`❌ MongoDB connection error: ${err.message}`, 'Database');
    });
  } catch (error) {
    logger.error(
      `❌ Could not access MongoDB connection: ${error.message}`,
      'Database',
    );
  }

  logger.log(
    `🚀 K-shap API running on http://localhost:${port}/${configService.get('API_PREFIX')}`,
    'Bootstrap',
  );
  logger.log(`📚 Environment: ${configService.get('NODE_ENV')}`, 'Bootstrap');
  logger.log(
    `🗄️  MongoDB URI: ${configService.get('MONGODB_URI')}`,
    'Bootstrap',
  );
  logger.log(
    `📖 Swagger documentation available at http://localhost:${port}/api-docs`,
    'Bootstrap',
  );
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
// import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve public folder
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      forbidNonWhitelisted: true,
      whitelist: true, // Remove redundant props based on DTOs
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://87.107.12.81:3000',
      'https://shahbanoo.shop',
      'https://www.shahbanoo.shop',
      'http://192.168.1.167:3000',
    ],
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true,
  });

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Optional: global interceptor
  // app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger setup
  const options = new DocumentBuilder()
    .setTitle('Cosmetic API')
    .setDescription('API list for Cosmetic project')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addServer('/api')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Start server
  const PORT = Number(process.env.PORT) || 3333;
  await app.listen(PORT, '0.0.0.0');
  Logger.log(`Server running on http://0.0.0.0:${PORT}`);
}

bootstrap();

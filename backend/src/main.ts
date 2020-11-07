import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const swaggerOpts = initSwagger();
  const document = SwaggerModule.createDocument(app, swaggerOpts);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}

function initSwagger() {
  return new DocumentBuilder()
    .setTitle('docx verifier')
    .setDescription('The docx verifier API description')
    .addBearerAuth
    // { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    // 'Authorization',
    ()
    .setVersion('1.0')
    .build();
}
bootstrap();

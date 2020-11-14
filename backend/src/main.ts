import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  const swaggerOpts = initSwagger();
  const document = SwaggerModule.createDocument(app, swaggerOpts);
  SwaggerModule.setup('api', app, document);
  const port = parseInt(process.env.PORT, 10) || 3000;
  await app.listen(port);
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

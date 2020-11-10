import { AutomapperModule } from 'nestjsx-automapper';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioModule } from './audio/audio.module';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import { NormalizeModule } from './normalize/normalize.module';
import { PageModule } from './page/page.module';
import { UserModule } from './user/user.module';
import { DocxModule } from './docx/docx.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB'),
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    UserModule,
    AuthModule,
    BookModule,
    PageModule,
    NormalizeModule,
    AudioModule,
    AutomapperModule.withMapper(),
    ConfigModule.forRoot(),
    DocxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

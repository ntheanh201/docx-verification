import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookModule } from './book/book.module';
import { PageModule } from './page/page.module';
import { NormalizeModule } from './normalize/normalize.module';
import { AudioModule } from './audio/audio.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'example',
      database: 'docx_verification',
      synchronize: true,
      autoLoadEntities: true,
    }),
    UserModule,
    AuthModule,
    BookModule,
    PageModule,
    NormalizeModule,
    AudioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

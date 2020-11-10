import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { MulterModule } from '@nestjs/platform-express';
import { uploadDir } from './constant';
import './book.profile';
import { DocxModule } from 'src/docx/docx.module';
import { PageModule } from 'src/page/page.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    MulterModule.register({ dest: uploadDir }),
    DocxModule,
    PageModule,
  ],
  providers: [BookService],
  controllers: [BookController],
})
export class BookModule {}

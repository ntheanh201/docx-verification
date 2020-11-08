import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { MulterModule } from '@nestjs/platform-express';
import { uploadDir } from './constant';
import './book.profile';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    MulterModule.register({ dest: uploadDir }),
  ],
  providers: [BookService],
  controllers: [BookController],
})
export class BookModule {}

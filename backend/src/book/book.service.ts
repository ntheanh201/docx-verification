import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookUploadDto } from './book.dto';
import { Book } from './book.entity';

@Injectable()
export class BookService {
  private logger = new Logger(BookService.name);
  constructor(@InjectRepository(Book) private bookRepo: Repository<Book>) {}
  async create(userID: number, file: BookUploadDto): Promise<Book> {
    this.logger.debug(`create new book: ${userID} : ${file.originalname}`);
    let book: Book = {
      name: file.originalname,
      url: file.path,
      uploader: userID,
      size: file.size,
      saved_name: file.filename,
      mimetype: file.mimetype,
    };
    let newBook = this.bookRepo.create(book);
    return this.bookRepo.save(newBook);
  }
  async findFrom(offset: number, limit: number): Promise<Book[]> {
    return this.bookRepo.find({
      skip: offset,
      take: limit,
      relations: ['uploader'],
    });
  }
  async delete(id: number): Promise<number> {
    const result = await this.bookRepo.delete(id);
    return result.affected;
  }
  count(): Promise<number> {
    return this.bookRepo.count();
  }
}

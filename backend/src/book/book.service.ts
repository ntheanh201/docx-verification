import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { DocxParseDto } from 'src/docx/docx.dto';
import { PageCreateDto } from 'src/page/page.dto';
import * as fs from 'fs';

import { Book, BookStatus } from './book.entity';
import { BookUploadDto } from './book.dto';
import { DocxService } from '../docx/docx.service';
import { PageService } from '../page/page.service';

@Injectable()
export class BookService {
  private logger = new Logger(BookService.name);
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    private readonly docxService: DocxService,
    private readonly pageService: PageService,
  ) {}
  async create(userID: number, file: BookUploadDto): Promise<Book> {
    this.logger.debug(`create new book: ${userID} : ${file.originalname}`);
    let book: Book = {
      name: file.originalname,
      url: file.path,
      uploader: userID,
      size: file.size,
      saved_name: file.filename,
      mimetype: file.mimetype,
      total_pages: 0,
      status: BookStatus.Pending,
    };
    let newBook = this.bookRepo.create(book);
    const result = await this.bookRepo.save(newBook);

    await this.docxService.parse(file.path).then(async (parseResult) => {
      await this.saveAllPages(userID, result.id, parseResult);
      result.total_pages = parseResult.original_pages.length;
      result.status = BookStatus.Done;
      this.bookRepo.save(result);
    });
    return result;
  }
  async findFrom(offset: number, limit: number): Promise<Book[]> {
    return this.bookRepo.find({
      skip: offset,
      take: limit,
      relations: ['uploader'],
    });
  }
  async delete(user_id: number, id: number): Promise<number> {
    const book = await this.bookRepo.findOne({ id, uploader: user_id });
    if (!book) {
      return 0;
    }
    const result = await this.bookRepo.delete(id);
    await this.pageService.deleteAllPages(id);
    const that = this;
    fs.stat(book.url, function (err, stats) {
      if (!err && stats.isFile()) {
        fs.unlink(book.url, function (err) {
          if (err) {
            that.logger.error(err);
          }
        });
      }
    });
    return result.affected;
  }
  count(): Promise<number> {
    return this.bookRepo.count();
  }
  private async saveAllPages(
    user: number,
    book_id: number,
    data: DocxParseDto,
  ) {
    const pages: PageCreateDto[] = [];
    for (var i = 0, len = data.normed_pages.length; i < len; i++) {
      const norm = data.normed_pages[i];
      const raw = data.original_pages[i];
      pages.push({
        book_id,
        page_num: i,
        text_raw: raw,
        text_norm: norm,
        uploader: user,
      });
    }
    //
    const result = await this.pageService.creates(pages);
    this.logger.debug('save all pages: ' + result.length);
  }
  async findOne(id: number): Promise<Book> {
    return this.bookRepo.findOne(id);
  }
}

import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { DocxParseDto } from 'src/docx/docx.dto';
import { PageCreateDto } from 'src/page/page.dto';

import { Book } from './book.entity';
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
    };
    let newBook = this.bookRepo.create(book);
    const result = await this.bookRepo.save(newBook);
    const parseResult = await this.docxService.parse(result.url);
    await this.saveAllPages(result.id, parseResult);
    return result;
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
  private async saveAllPages(book_id: number, data: DocxParseDto) {
    const pages: PageCreateDto[] = [];
    for (var i = 0, len = data.normed_pages.length; i < len; i++) {
      const norm = data.normed_pages[i];
      const raw = data.original_pages[i];
      pages.push({
        book_id,
        page_num: i,
        text_raw: raw,
        text_norm: norm,
      });
    }
    //
    const result = await this.pageService.creates(pages);
    this.logger.debug('save all pages: ' + JSON.stringify(result));
  }
}

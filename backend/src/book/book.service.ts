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

  async create(
    userID: number,
    file: BookUploadDto,
    defaultVoice: string,
  ): Promise<Book> {
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
      default_voice: defaultVoice,
      created_at: new Date(),
    };
    let newBook = this.bookRepo.create(book);
    const result = await this.bookRepo.save(newBook);

    await this.docxService.parse(file.path).then(async (parseResult) => {
      await this.saveAllPages(userID, result.id, parseResult, defaultVoice);
      result.total_pages = parseResult.original_pages.length;
      result.status = BookStatus.Done;
      return this.bookRepo.save(result);
    });
    return result;
  }

  async findFrom(offset: number, limit: number): Promise<Book[]> {
    return this.bookRepo.find({
      skip: offset,
      take: limit,
      relations: ['uploader'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async delete(user_id: number, id: number): Promise<number> {
    const book = await this.bookRepo.findOne({ id, uploader: user_id });
    if (!book) {
      return 0;
    }
    const result = await this.bookRepo.delete(id);
    await this.pageService.deleteAllPages(id);
    const hasSfb = await this.hasSameFileBook(book.url);
    if (!hasSfb) {
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
    }

    return result.affected;
  }

  async hasSameFileBook(url: string): Promise<boolean> {
    const count = await this.bookRepo.count({ where: { url: url } });
    return count > 0;
  }

  count(): Promise<number> {
    return this.bookRepo.count();
  }

  private async saveAllPages(
    user: number,
    book_id: number,
    data: DocxParseDto,
    defaultVoice: string,
  ) {
    const pages: PageCreateDto[] = [];
    for (let i = 0, len = data.normed_pages.length; i < len; i++) {
      const norm = data.normed_pages[i];
      const raw = data.original_pages[i];
      pages.push({
        book_id,
        page_num: i,
        text_raw: raw,
        text_norm: norm,
        uploader: user,
        voice_id: defaultVoice,
      });
    }
    //
    const result = await this.pageService.creates(pages);
    this.logger.debug('save all pages: ' + result.length);
  }

  async findOne(id: number): Promise<Book> {
    return this.bookRepo.findOne(id);
  }

  async mergeAllAudioURLS(id: number): Promise<string | undefined> {
    const url: string | undefined = await this.pageService.mergeAllAudioURLs(
      id,
    );
    if (!url) {
      return undefined;
    }
    await this.bookRepo.update(id, { audio_url: url });
    return url;
  }

  async clone(id: number, voice_id: string): Promise<Book | undefined> {
    const book = await this.bookRepo.findOne(id, { relations: ['uploader'] });
    if (!book) {
      return book;
    }
    //copy this book and delete its id
    const _nBook: Book = {
      ...book,
      default_voice: voice_id,
      status: BookStatus.Pending,
      created_at: new Date(),
    };
    delete _nBook.id;
    //and save it to db
    let nBook = await this.bookRepo.create(_nBook);
    nBook = await this.bookRepo.save(nBook);
    // clone all pages with new id
    const new_id = nBook.id;
    await this.pageService.cloneAllPages(id, new_id, voice_id);
    return nBook;
  }
}

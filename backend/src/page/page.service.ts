import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { AudioService } from '../audio/audio.service';
import { NormalizeService } from '../normalize/normalize.service';
import { Page, PageStatus } from './page.entity';
import { PageCreateDto } from './page.dto';
import { AudioResponseDto } from 'src/audio/audio.dto';

@Injectable()
export class PageService {
  private logger = new Logger(PageService.name);
  constructor(
    @InjectRepository(Page) private repo: Repository<Page>,
    private normalizeService: NormalizeService,
    private audioService: AudioService,
  ) {
    this.audioService.subscribe((a: AudioResponseDto) => {
      this.logger.debug('resolve audio :' + JSON.stringify(a));
      this.updateAudioURL(a.page_id, a.url);
    });
  }
  async getAndGetNormlizedText(
    book_id: number,
    page: number,
    user: number,
  ): Promise<Page | undefined> {
    let result = await this.get(book_id, page);
    if (!result) {
      return undefined;
    }
    //check if raw_text is not empty and text_norm is empty (not normlized)
    //then normlize it
    if (result.text_norm === '' && result.text_raw !== '') {
      const normalize = await this.normalizeService.normalize(result.text_raw);
      if (normalize.status && normalize.normText !== '') {
        result = await this.updateTextNormAndReviewer(
          page,
          user,
          normalize.normText,
        );
      }
    }
    return result;
  }
  async get(book_id: number, page: number): Promise<Page> {
    return this.repo.findOne({ book_id, page_num: page });
  }
  async countPages(book_id: number) {
    return this.repo.count({ book_id });
  }
  async create(page: PageCreateDto): Promise<Page> {
    const newPage = this.repo.create({
      book_id: page.book_id,
      page_num: page.page_num,
      text_raw: page.text_raw,
      text_norm: page.text_norm,
      uploader: page.uploader,
      //
      status: PageStatus.Waiting,
    });
    return this.repo.save(newPage);
  }
  async creates(pages: PageCreateDto[]): Promise<any[]> {
    const result = await this.repo
      .createQueryBuilder()
      .insert()
      .into(Page)
      .values(pages.map((page) => ({ ...page, status: PageStatus.Waiting })))
      .execute();
    return result.identifiers;
  }
  async updateTextNormAndReviewer(
    page_id: number,
    reviewer_id: number,
    text: string,
  ): Promise<Page | undefined> {
    const page = await this.repo.findOne(page_id);
    if (!page) {
      return undefined;
    }
    page.text_norm = text;
    page.reviewer = reviewer_id;
    return this.repo.save(page);
  }

  async updateStatusAndReviewer(
    page_id: number,
    reviewer_id: number,
    status: PageStatus,
  ): Promise<Page | undefined> {
    const page = await this.repo.findOne(page_id);
    if (!page) {
      return undefined;
    }
    page.status = status;
    page.reviewer = reviewer_id;
    return this.repo.save(page);
  }
  async updateAudioURL(
    page_id: number,
    url: string,
  ): Promise<Page | undefined> {
    const page = await this.repo.findOne(page_id);
    if (!page) {
      return undefined;
    }
    page.audio_url = url;
    return this.repo.save(page);
  }
  async updateTaskID(
    page_id: number,
    task_id: string,
  ): Promise<Page | undefined> {
    const page = await this.repo.findOne(page_id);
    if (!page) {
      return undefined;
    }
    page.task_id = task_id;
    return this.repo.save(page);
  }
  async findOne(id: number): Promise<Page> {
    return this.repo.findOne(id);
  }
  async save(page: Page): Promise<Page> {
    return this.repo.save(page);
  }
  async getAllPendings(): Promise<Page[]> {
    return this.repo.find({ status: PageStatus.Pending });
  }
  async genAudio(page_id: number): Promise<boolean | undefined> {
    const page: Page = await this.findOne(page_id);
    if (!page) {
      return undefined;
    }
    this.audioService.publish(
      { page_id: page.id, text: page.text_norm },
      (c) => {
        page.task_id = c.id;
        page.status = PageStatus.Pending;
        this.save(page);
      },
    );
    return true;
  }
  async deleteAllPages(book_id: number): Promise<number> {
    const result = await this.repo.delete({ book_id });
    return result.affected;
  }
}

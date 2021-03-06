import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IsNull, Repository, Not, In } from 'typeorm';

import { AudioService } from '../audio/audio.service';
import { Page, PageStatus } from './page.entity';
import { PageCreateDto } from './page.dto';
import { AudioResponseDto } from 'src/audio/audio.dto';

@Injectable()
export class PageService {
  private logger = new Logger(PageService.name);

  constructor(
    @InjectRepository(Page) private repo: Repository<Page>,
    private audioService: AudioService,
  ) {
    this.audioService.subscribe((a: AudioResponseDto) => {
      this.logger.debug('resolve audio :' + JSON.stringify(a));
      this.updateAudioURL(a.page_id, a.url, a.task_id);
    });
    this.recoverNotCompletedTasks();
  }

  async getAndGetNormlizedText(
    book_id: number,
    page: number,
    // user: number,
  ): Promise<Page | undefined> {
    let result = await this.get(book_id, page);
    if (!result) {
      return undefined;
    }
    ////check if raw_text is not empty and text_norm is empty (not normlized)
    ////then normlize it
    //if (result.text_norm === '' && result.text_raw !== '') {
    //  const normalize = await this.normalizeService.normalize(result.text_raw);
    //  if (normalize.status && normalize.normText !== '') {
    //    result = await this.updateTextNormAndReviewer(
    //      page,
    //      user,
    //      normalize.normText,
    //    );
    //  }
    //}
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
  ): Promise<Page | undefined> {
    const page = await this.repo.findOne(page_id);
    if (!page) {
      return undefined;
    }
    switch (page.status) {
      case PageStatus.HasAudio:
      case PageStatus.Waiting:
      case PageStatus.Pending:
        page.status = PageStatus.Verified;
        break;
      default:
        page.status = PageStatus.Pending;
    }
    page.reviewer = reviewer_id;
    return this.repo.save(page);
  }

  async updateAudioURL(
    page_id: number,
    url: string,
    task_id: string,
  ): Promise<Page | undefined> {
    const page = await this.repo.findOne({ id: page_id, task_id: task_id });
    if (!page) {
      return undefined;
    }
    page.audio_url = url;
    page.status = PageStatus.HasAudio;
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

  async findAndGenAudio(page_id: number): Promise<boolean | undefined> {
    const page: Page = await this.findOne(page_id);
    if (!page) {
      return undefined;
    }
    await this.genAudio(page);
    return true;
  }

  async genAudio(page: Page) {
    await this.audioService.publish(
      { page_id: page.id, text: page.text_norm, voice_id: page.voice_id },
      async (c) => {
        page.audio_url = null;
        page.task_id = c.id;
        page.status = PageStatus.Pending;
        await this.save(page);
      },
    );
  }

  async deleteAllPages(book_id: number): Promise<number> {
    const result = await this.repo.delete({ book_id });
    return result.affected;
  }

  loadNotCompletedTasks() {
    return this.repo.find({ audio_url: IsNull(), task_id: Not(IsNull()) });
  }

  async recoverNotCompletedTasks() {
    const pages = await this.loadNotCompletedTasks();
    this.audioService.recover(
      pages.map((page) => ({
        page_id: page.id,
        text: page.text_norm,
        task_id: page.task_id,
        voice_id: page.voice_id,
      })),
    );
    this.logger.log('recover: ' + pages.length + ' tasks');
  }

  isAudioTaskCompleted(task_id: string): boolean {
    return !this.audioService.isProgressing(task_id);
  }

  async getBookProgress(
    book_id: number,
  ): Promise<{ verified: number; totals: number }> {
    const [verified, totalPages] = await Promise.all([
      this.repo.count({
        where: { book_id: book_id, status: PageStatus.Verified },
      }),
      this.repo.count({ where: { book_id: book_id } }),
    ]);
    return { verified, totals: totalPages };
  }

  async mergeAllAudioURLs(book_id: number): Promise<string | undefined> {
    const task_ids = await this.getVerifiedTaskIDs(book_id);
    return await this.audioService.mergeAudioURLS(task_ids);
  }

  // async getAllPageTaskIDs(book_id: number): Promise<string[]> {
  //     const pages = await this.repo.find({where: {book_id}})
  //     return pages.map(page => page.task_id)
  // }

  async genAllAudio(book_id: number) {
    const pages = await this.repo.find({
      where: { book_id: book_id },
      order: { page_num: 'ASC' },
    });

    const invalids = pages.filter((page) => !page.voice_id);
    if (invalids.length > 0) {
      return false;
    }

    for (const page of pages) {
      await this.genAudio(page);
    }
    return true;
  }

  async getBookGenAudioProgress(
    book_id: number,
  ): Promise<{ generated: number; totals: number }> {
    const [generated, totals] = await Promise.all([
      this.repo.count({
        where: [
          {
            book_id: book_id,
            status: In([PageStatus.HasAudio, PageStatus.Verified]),
          },
        ],
      }),
      this.repo.count({ where: { book_id: book_id } }),
    ]);
    return { generated, totals };
  }

  async cloneAllPages(old_book_id: number, book_id: number, voice_id: string) {
    const pages = await this.repo.find({ where: { book_id: old_book_id } });
    return this.creates(
      pages.map((page) => {
        delete page.id;
        delete page.task_id;
        delete page.audio_url;
        delete page.reviewer;
        delete page.voice_id;
        page.book_id = book_id;
        page.voice_id = voice_id;
        return page;
      }),
    );
  }

  async compressAllAudioURLs(book_id: number) {
    const task_ids = await this.getVerifiedTaskIDs(book_id);
    return await this.audioService.compressAudioURLS(task_ids);
  }

  private async getVerifiedTaskIDs(book_id: number) {
    type pageKeys = keyof Page;
    const result = await this.repo.find({
      where: {
        book_id: book_id,
        status: In([PageStatus.HasAudio, PageStatus.Verified]),
      },
      order: { page_num: 'ASC' },
      select: ['task_id' as pageKeys],
    });

    if (result.length === 0) {
      throw new BadRequestException('Chưa page nào có audio !');
    }

    const total = await this.repo.count({ where: { book_id: book_id } });
    if (total !== result.length) {
      throw new BadRequestException('Có 1 số page chưa được sinh audio');
    }
    return result.map((page) => {
      return page.task_id;
    });
  }
}

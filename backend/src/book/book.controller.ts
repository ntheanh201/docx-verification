import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  UseGuards,
  Get,
  Query,
  ParseIntPipe,
  Delete,
  Param,
  BadRequestException,
  NotFoundException,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.decorator';
import { BookUploadDto, BookVm } from './book.dto';
import { BookService } from './book.service';
import { uploadDir } from './constant';
import * as path from 'path';
import * as fs from 'fs';
import { AutoMapper } from '@nartc/automapper';
import { Book } from './book.entity';
import { InjectMapper } from 'nestjsx-automapper';
import { UserVm } from 'src/user/user.dto';

@Controller('books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BookController {
  private readonly logger = new Logger(BookController.name);
  private readonly pageSize = 10;
  constructor(
    private readonly bookService: BookService,
    @InjectMapper() private readonly mapper: AutoMapper,
  ) {}
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async upload(@UploadedFile() file: BookUploadDto, @User() user: UserVm) {
    this.logger.debug(`upload new book : ${file.originalname}`);
    return await this.bookService.create(user.id, file);
  }
  @Get()
  async list(@Query('page', ParseIntPipe) page: number) {
    if (page < 0) {
      throw new BadRequestException('page must be greater than 0');
    }
    const offset = page * this.pageSize;
    const books = await this.bookService.findFrom(offset, this.pageSize);
    const vmBooks = this.mapper.mapArray(books, BookVm, Book);
    const total = await this.bookService.count();
    return {
      books: vmBooks,
      current_page: page,
      total_pages: Math.ceil(total / this.pageSize),
      page_size: this.pageSize,
    };
  }

  @Delete('/:id')
  async del(@Param('id', ParseIntPipe) id: number, @User() user: UserVm) {
    const affected = await this.bookService.delete(user.id, id);
    return { books: affected };
  }
  @Get('download/:saved_name')
  async download(@Param('saved_name') name: string, @Response() res: any) {
    const filePath = path.join(uploadDir, name);
    try {
      await new Promise((resolve, reject) =>
        fs.stat(filePath, (err, stats) => {
          if (err || stats.isDirectory()) {
            return reject(err);
          }
          resolve();
        }),
      );
      res.download(filePath);
    } catch (e) {
      /* handle error */
      this.logger.error(e);
      throw new NotFoundException('file not found');
    }
  }
}

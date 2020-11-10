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
import { ApiBearerAuth } from '@nestjs/swagger';
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
import { DocxService } from 'src/docx/docx.service';

@Controller('book')
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
  async upload(@UploadedFile() file: BookUploadDto, @User() user: any) {
    this.logger.debug(`upload new book : ${file.originalname}`);
    return await this.bookService.create(user.id, file);
  }
  @Get()
  async list(@Query('page', ParseIntPipe) page: number) {
    if (page < 0) {
      throw new BadRequestException('page must be greater than 0');
    }
    const offset = page * this.pageSize;
    const result = await this.bookService.findFrom(offset, this.pageSize);
    return this.mapper.mapArray(result, BookVm, Book);
  }
  @Get('count')
  async count() {
    const books = await this.bookService.count();
    return { pages: books };
  }
  @Delete('/:id')
  async del(@Param('id', ParseIntPipe) id: number) {
    const affected = await this.bookService.delete(id);
    return { affected };
  }
  @Get('download/:name')
  async download(@Param('name') name: string, @Response() res: any) {
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

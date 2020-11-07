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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.decorator';
import { BookUploadDto } from './book.dto';
import { BookService } from './book.service';

@Controller('book')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BookController {
  private readonly logger = new Logger(BookController.name);
  private readonly pageSize = 10;
  constructor(private bookService: BookService) {}
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async upload(@UploadedFile() file: BookUploadDto, @User() user: any) {
    this.logger.debug(`upload new book : ${file.originalname}`);
    const newBook = await this.bookService.create(user.id, file);
    //call get content API
    //save page content to page repo
    return newBook;
  }
  @Get()
  list(@Query('page', ParseIntPipe) page: number) {
    if (page < 0) {
      throw new BadRequestException('page must be greater than 0');
    }
    const offset = page * this.pageSize;
    return this.bookService.findFrom(offset, this.pageSize);
  }
  @Delete('/:id')
  del(@Param('id', ParseIntPipe) id: number): Promise<number> {
    return this.bookService.delete(id);
  }
}

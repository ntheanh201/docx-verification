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
    Body,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiBearerAuth, ApiConsumes, ApiBody} from '@nestjs/swagger';
import {JwtAuthGuard} from 'src/auth/jwt-auth.guard';
import {User} from 'src/user/user.decorator';
import {
    BookCloneDto, BookCompressDto,
    BookGetDto,
    BookMergeDto,
    BookUploadDto,
    BookVm, Filter, FilterVm, Sorter, SorterVm,
} from './book.dto';
import {BookService} from './book.service';
import {uploadDir} from './constant';
import * as path from 'path';
import * as fs from 'fs';
import {AutoMapper} from '@nartc/automapper';
import {Book} from './book.entity';
import {InjectMapper} from 'nestjsx-automapper';
import {UserVm} from 'src/user/user.dto';
import {ConfigService} from '@nestjs/config';

@Controller('books')
@ApiBearerAuth()
export class BookController {
    private readonly logger = new Logger(BookController.name);
    private readonly pageSize = 10;
    private readonly uploadDir: string;

    constructor(
        private readonly bookService: BookService,
        @InjectMapper() private readonly mapper: AutoMapper,
        readonly configService: ConfigService,
    ) {
        this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || uploadDir;
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {type: 'string', format: 'binary'},
                default_voice: {type: 'string'},
            },
        },
    })
    async upload(
        @UploadedFile() file: BookUploadDto,
        @User() user: UserVm,
        @Body('default_voice') defaultVoice: string,
    ) {
        if (!defaultVoice) {
            throw new BadRequestException('default_voice is required');
        }
        this.logger.debug(
            `upload new book : ${file.originalname} with voice ${defaultVoice}`,
        );
        return await this.bookService.create(user.id, file, defaultVoice);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async list(
        // @Query('page', ParseIntPipe) page: number,
        @Body() body: BookGetDto,
    ) {
        if (body.page < 0) {
            throw new BadRequestException('page must be greater than 0');
        }
        const sorter = this.mapper.map(body.sorter, Sorter, SorterVm)
        const filters = this.mapper.map(body.filters, Filter, FilterVm)
        const offset = body.page * this.pageSize;
        const books = await this.bookService.findFrom(offset, this.pageSize, filters, sorter);
        const vmBooks = this.mapper.mapArray(books, BookVm, Book);
        const total = await this.bookService.count();
        return {
            books: vmBooks,
            current_page: body.page,
            total_pages: Math.ceil(total / this.pageSize),
            page_size: this.pageSize,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async get(@Param('id', ParseIntPipe) id: number) {
        const book = await this.bookService.findOne(id);
        if (!book) {
            throw new NotFoundException();
        }
        return book;
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async del(@Param('id', ParseIntPipe) id: number, @User() user: UserVm) {
        const affected = await this.bookService.delete(user.id, id);
        return {books: affected};
    }

    @Get('download/:saved_name')
    async download(@Param('saved_name') name: string, @Response() res: any) {
        const filePath = path.join(this.uploadDir, name);
        try {
            await new Promise((resolve, reject) =>
                fs.stat(filePath, (err, stats) => {
                    if (err || stats.isDirectory()) {
                        return reject(err);
                    }
                    resolve();
                }),
            );
            res.download(filePath, name + '.docx');
        } catch (e) {
            /* handle error */
            this.logger.error(e);
            throw new NotFoundException('file not found');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('merge_audio')
    async mergeAudio(@Body() body: BookMergeDto) {
        const audio_url = await this.bookService.mergeAllAudioURLS(body.book_id);
        return {audio_url, ...body};
    }

    @UseGuards(JwtAuthGuard)
    @Post('compress_audio')
    async compressAudio(@Body() body: BookCompressDto) {
        const audio_url = await this.bookService.compressAllAudioURLS(body.book_id);
        return {audio_url, ...body};
    }

    @Post('clone')
    @UseGuards(JwtAuthGuard)
    async clone(@Body() body: BookCloneDto) {
        const book_id = body.book_id;
        const result = await this.bookService.clone(book_id, body.voice_id);
        if (!result) {
            throw new NotFoundException('source book not found');
        }
        return result;
    }

}

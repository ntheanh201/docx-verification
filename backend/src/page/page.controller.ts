import { ApiBearerAuth } from '@nestjs/swagger';
import { AutoMapper } from '@nartc/automapper';
import {
  Controller,
  Get,
  Param,
  Put,
  Post,
  Body,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { InjectMapper } from 'nestjsx-automapper';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserVm } from 'src/user/user.dto';
import { Page, PageStatus } from './page.entity';
import { PageService } from './page.service';
import {
  PageGenAudioDto,
  PageMarkVerifiedDto,
  PageUpdateTextNormDto,
  PageVm,
} from './page.dto';
import { User } from '../user/user.decorator';

@Controller('page')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PageController {
  constructor(
    private service: PageService,
    @InjectMapper() private mapper: AutoMapper,
  ) {}
  @Get('/:book/:page/info')
  async get(
    @Param('book', ParseIntPipe) book_id: number,
    @Param('page', ParseIntPipe) page: number,
    @User() user: UserVm,
  ) {
    let result = await this.service.getAndGetNormlizedText(
      book_id,
      page,
      user.id,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return this.mapper.map(result, PageVm, Page);
  }
  @Get('count/:book')
  async count(@Param('book', ParseIntPipe) book_id: number) {
    const result = await this.service.countPages(book_id);
    return { pages: result };
  }
  @Put('norm_text')
  async updateNormText(
    @Body() body: PageUpdateTextNormDto,
    @User() user: UserVm,
  ) {
    const result = await this.service.updateTextNormAndReviewer(
      body.page_id,
      user.id,
      body.text_norm,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return this.mapper.map(result, PageVm, Page);
  }
  @Post('gen_audio')
  async genAudio(@Body() body: PageGenAudioDto) {
    const result = await this.service.genAudio(body.page_id);
    if (result === undefined) {
      throw new NotFoundException();
    }
    return { status: 'success' };
  }
  @Put('verified')
  async markVerified(@Body() body: PageMarkVerifiedDto, @User() user: UserVm) {
    const result = await this.service.updateStatusAndReviewer(
      body.page_id,
      user.id,
      PageStatus.Verified,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return this.mapper.map(result, PageVm, Page);
  }
}
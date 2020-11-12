import { PageStatus } from './page.entity';
import { IsNumberString, Min, IsNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PageCreateDto {
  book_id: number;
  page_num: number;
  text_raw: string;
  text_norm: string;
  uploader: number;
}

export class PageVm {
  id: number;
  book_id: number;
  page_num: number;
  status: PageStatus;
  reviewer: number;
  text_raw: string;
  text_norm: string;
  task_id: string;
  audio_url: string;
  uploader: number;
}

export class PageUpdateTextNormDto {
  @ApiProperty({ example: 0 })
  @Min(0)
  page_id: number;
  @ApiProperty({ example: 0 })
  @MinLength(0)
  text_norm: string;
}

export class PageMarkVerifiedDto {
  @ApiProperty({ example: 0 })
  @Min(0)
  page_id: number;
}

export class PageGetDto {
  @ApiProperty({ example: 0 })
  @IsNumberString()
  @Min(0)
  book: number;
  @ApiProperty({ example: 0 })
  @IsNumberString()
  @Min(0)
  page: number;
}

export class PageCountDto {
  @ApiProperty({ example: 0 })
  @IsNumberString()
  book_id: number;
}

export class PageGenAudioDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  page_id: number;
}

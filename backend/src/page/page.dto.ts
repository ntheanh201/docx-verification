import { PageStatus } from './page.entity';
import { IsNumberString, Min, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PageCreateDto {
  book_id: number;
  page_num: number;
  text_raw: string;
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
}

export class PageUpdateTextNormDto {
  @ApiProperty({ example: 0 })
  @Min(0)
  page_id: number;
  @ApiProperty({ example: 0 })
  @Min(0)
  text_norm: string;
}

export class PageMarkVerifiedDto {
  @ApiProperty({ example: 0 })
  @Min(0)
  page_id: number;
}

export class PageGetDto {
  @ApiProperty({ example: '0' })
  @IsNumberString()
  book_id: string;
  @ApiProperty({ example: '0' })
  @IsNumberString()
  page_id: string;
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

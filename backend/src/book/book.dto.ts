import { ApiProperty } from '@nestjs/swagger';
import { Min, IsNumberString } from 'class-validator';
export class BookUploadDto {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: string;
}

export class BookGetDto {
  @IsNumberString()
  @ApiProperty({ example: 0, required: true, default: 0 })
  page: number;
}

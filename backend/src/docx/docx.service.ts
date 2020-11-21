import { HttpService, Injectable, Logger } from '@nestjs/common';
import * as FormData from 'form-data';
import { AxiosResponse } from 'axios';
import * as fs from 'fs';
import { DocxParseDto } from './docx.dto';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocxService {
  private url: string;
  private logger = new Logger(DocxService.name);
  constructor(private httpSerivce: HttpService, configService: ConfigService) {
    this.url = configService.get<string>('DOCX_API');
  }

  parse(path: string): Promise<DocxParseDto> {
    this.logger.debug(`parse docx file: ${path}`);
    const data = new FormData();
    data.append('file', fs.createReadStream(path));
    return this.httpSerivce
      .post(this.url, data, { headers: data.getHeaders() })
      .pipe(
        map((res: AxiosResponse): DocxParseDto => res.data),
        catchError((err) => {
          this.logger.debug(err.toString());
          throw err;
        }),
      )
      .toPromise();
  }
}

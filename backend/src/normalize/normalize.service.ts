import { ConfigService } from '@nestjs/config';
import { HttpService, Injectable, Logger } from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { NormalizeDto } from './normalize.dto';
import { stringify } from 'qs';

@Injectable()
export class NormalizeService {
  private normalizeAPI: string;
  private logger = new Logger(NormalizeService.name);
  constructor(private httpService: HttpService, configService: ConfigService) {
    this.normalizeAPI = configService.get<string>('NORMALIZE_API');
  }
  async normalize(text: string): Promise<NormalizeDto> {
    this.logger.debug('normalize request:');
    const data = stringify({ content: text });
    const response: NormalizeDto = await this.httpService
      .post(this.normalizeAPI, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(
        map((res: AxiosResponse) => {
          return res.data;
        }),
        catchError((err) =>
          of({ status: false, messsage: err.toString(), normText: '' }),
        ),
      )
      .toPromise();
    this.logger.debug(
      `normalize response: ${response.status} ${response.message} ${response.executeTime} `,
    );
    return response;
  }
}

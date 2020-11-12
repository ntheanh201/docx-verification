import { ConfigService } from '@nestjs/config';
import { HttpService, Injectable, Logger } from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import * as FormData from 'form-data';

import { AxiosResponse } from 'axios';

import {
  AudioPublishDto,
  AudioResponseDto,
  AudioTaskDto,
  callCheckTaskApiResponse,
  callGetTaskApiResponse,
  callInfoResponse,
} from './audio.dto';

type Subscriber = (a: AudioResponseDto) => any;

type QueueTaskCallback = (c: callGetTaskApiResponse) => any;

@Injectable()
export class AudioService {
  private getTaskAPI: string;
  private getInfoAPI: string;
  private checkTaskStatusAPI: string;
  private queues: AudioTaskDto[];
  private subscribers: Subscriber[];
  private logger = new Logger(AudioService.name);
  constructor(configService: ConfigService, private httpService: HttpService) {
    this.getTaskAPI = configService.get<string>('AUDIO_GET_TASK_API');
    this.checkTaskStatusAPI = configService.get<string>('AUDIO_CHECK_TASK_API');
    this.getInfoAPI = configService.get<string>('AUDIO_INFO_API');
    this.queues = [];
    this.subscribers = [];
    this.scheduleCheckTasksStatus();
  }
  recover(tasks: AudioTaskDto[]) {
    this.queues.push(...tasks);
  }
  async publish(task: AudioPublishDto, cb: QueueTaskCallback) {
    this.logger.debug('publish new task: ' + JSON.stringify(task));
    const taskResponse: callGetTaskApiResponse = await this.getTaskID(task);
    this.logger.debug('init task: ' + JSON.stringify(taskResponse));
    cb(taskResponse);
    this.queues.push({
      task_id: taskResponse.id,
      page_id: task.page_id,
    });
  }
  subscribe(sub: Subscriber) {
    this.subscribers.push(sub);
  }
  unsubscribe(sub: Subscriber) {
    this.subscribers = this.subscribers.filter((s) => s !== sub);
  }
  // TODO: edit it
  private async getTaskID(
    task: AudioPublishDto,
  ): Promise<callGetTaskApiResponse> {
    return this.httpService
      .get(this.getInfoAPI)
      .pipe(
        map(
          (res: AxiosResponse): callInfoResponse => {
            return res.data;
          },
        ),
      )
      .pipe(
        map(async (res: callInfoResponse) => {
          var data = new FormData();
          data.append('token', 'WNBIUqP5TUje5piwbbfLU21itCfoOLRD');
          data.append('voiceId', res.voices[0].id);
          data.append('text', task.text);

          return await this.httpService
            .post(this.getTaskAPI, data, { headers: data.getHeaders() })
            .pipe(
              map((res: AxiosResponse) => res.data),
              catchError((err) => of({ message: err.toString() })),
            )
            .toPromise();
        }),
      )
      .toPromise();
  }
  private async checkTaskStatus(
    task_id: string,
  ): Promise<callCheckTaskApiResponse> {
    const res: callCheckTaskApiResponse = await this.httpService
      .get(this.checkTaskStatusAPI + task_id)
      .pipe(
        map((res: AxiosResponse) => res.data),
        catchError((err) => of({ message: err.toString() })),
      )
      .toPromise();
    return res;
  }
  private publishToAllSubscribers(task: AudioResponseDto) {
    this.subscribers.forEach((sub) => sub(task));
  }
  private scheduleCheckTasksStatus() {
    setInterval(async () => {
      const remainTasks: AudioTaskDto[] = [];
      // this.logger.debug('check queue');
      for (let task of this.queues) {
        this.logger.debug('check task: ' + JSON.stringify(task));
        const res = await this.checkTaskStatus(task.task_id);
        this.logger.debug('task status response: ' + JSON.stringify(res));
        if (res.status === 0) {
          //remove this task from queues
          //and publish it to subscribers
          this.logger.debug('push to all sub: ' + JSON.stringify(res));
          this.publishToAllSubscribers({
            ...task,
            url: res.url,
          });
        } else {
          remainTasks.push(task);
        }
      }
      //update current queues with new one without resolved task
      this.queues = remainTasks;
    }, 5000);
  }
}

import { ConfigService } from '@nestjs/config';
import { HttpService, Injectable } from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

import { AxiosResponse } from 'axios';

import {
  AudioPublishDto,
  AudioResponseDto,
  AudioTaskDto,
  callCheckTaskApiResponse,
  callGetTaskApiResponse,
} from './audio.dto';

type Subscriber = (a: AudioResponseDto) => any;

type QueueTaskCallback = (c: callGetTaskApiResponse) => any;

@Injectable()
export class AudioService {
  private getTaskAPI: string;
  private checkTaskStatusAPI: string;
  private queues: AudioTaskDto[];
  private subscribers: Subscriber[];
  constructor(configService: ConfigService, private httpService: HttpService) {
    this.getTaskAPI = configService.get<string>('AUDIO_GET_TASK_API');
    this.checkTaskStatusAPI = configService.get<string>('AUDIO_CHECK_TASK_API');
    this.queues = [];
    this.subscribers = [];
    this.scheduleCheckTasksStatus();
  }
  recover(tasks: AudioTaskDto[]) {
    this.queues.push(...tasks);
  }
  async publish(task: AudioPublishDto, cb: QueueTaskCallback) {
    const taskResponse: callGetTaskApiResponse = await this.getTaskID(task);
    cb(taskResponse);
    this.queues.push({
      task_id: taskResponse.task_id,
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
    const res: callGetTaskApiResponse = await this.httpService
      .post(this.getTaskAPI, task)
      .pipe(
        map((res: AxiosResponse) => res.data),
        catchError((err) => of({ message: err.toString() })),
      )
      .toPromise();
    return res;
  }
  private async checkTaskStatus(
    task_id: string,
  ): Promise<callCheckTaskApiResponse> {
    const res: callCheckTaskApiResponse = await this.httpService
      .post(this.checkTaskStatusAPI, { task_id })
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
      for (let task of this.queues) {
        const res = await this.checkTaskStatus(task.task_id);
        if (res.status === 'success') {
          //remove this task from queues
          //and publish it to subscribers
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

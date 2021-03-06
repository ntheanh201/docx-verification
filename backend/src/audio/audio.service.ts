import {ConfigService} from '@nestjs/config';
import {HttpService, Injectable, Logger} from '@nestjs/common';
import {catchError, map} from 'rxjs/operators';
import {of} from 'rxjs';
import * as FormData from 'form-data';

import {AxiosResponse} from 'axios';

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
    private readonly token: string;
    private mergeAPI: string;
    private queues: AudioTaskDto[];
    private isChecking: boolean;
    private subscribers: Subscriber[];
    private logger = new Logger(AudioService.name);
    private compressAPI: string;

    constructor(configService: ConfigService, private httpService: HttpService) {
        this.getTaskAPI = configService.get<string>('AUDIO_GET_TASK_API');
        this.checkTaskStatusAPI = configService.get<string>('AUDIO_CHECK_TASK_API');
        this.getInfoAPI = configService.get<string>('AUDIO_INFO_API');
        this.token = configService.get<string>('AUDIO_TOKEN');
        this.mergeAPI = configService.get<string>('AUDIO_MERGE_API');
        this.compressAPI = configService.get<string>('AUDIO_COMPRESS_API');
        this.queues = [];
        this.isChecking = false;
        this.subscribers = [];
        this.scheduleCheckTasksStatus();
    }

    isProgressing(task_id: string): boolean {
        return this.queues.some((task) => task.task_id === task_id);
    }

    recover(tasks: AudioTaskDto[]) {
        this.queues.push(...tasks);
    }

    async publish(task: AudioPublishDto, cb: QueueTaskCallback) {
        this.logger.debug(`publish new task: ${task.page_id} ${task.voice_id}`);
        const taskResponse: callGetTaskApiResponse = await this.getTaskID(task);
        // this.logger.debug(`get task response: ${JSON.stringify(taskResponse)}`);
        if (taskResponse.status !== 0) {
            this.logger.error('invalid task: ' + JSON.stringify(task));
            return;
        }
        this.logger.debug('init task: ' + JSON.stringify(taskResponse));
        this.queues.push({
            task_id: taskResponse.id,
            page_id: task.page_id,
            voice_id: task.voice_id,
        });
        await cb(taskResponse);
    }

    subscribe(sub: Subscriber) {
        this.subscribers.push(sub);
    }

    unsubscribe(sub: Subscriber) {
        this.subscribers = this.subscribers.filter((s) => s !== sub);
    }

    getVoices(): Promise<callInfoResponse> {
        return this.httpService
            .get(this.getInfoAPI)
            .pipe(
                map(
                    (res: AxiosResponse): callInfoResponse => {
                        return res.data;
                    },
                ),
                catchError((e) => {
                    this.logger.error(e.toString());
                    throw e;
                }),
            )
            .toPromise();
    }

    private async getTaskID(
        task: AudioPublishDto,
    ): Promise<callGetTaskApiResponse> {
        const data = new FormData();
        data.append('token', this.token);
        data.append('voiceId', task.voice_id);
        data.append('text', task.text);
        const timeout = 5000
        // this.logger.debug(`try to get task id: ${task.page_id}`)
        return await this.httpService
            .post(this.getTaskAPI, data, {headers: {...data.getHeaders()}, timeout})
            .pipe(
                map((res: AxiosResponse) => res.data),
                catchError((err) => {
                    this.logger.error(err.toString());
                    throw err;
                }),
            )
            .toPromise();
    }

    private async checkTaskStatus(
        task_id: string,
    ): Promise<callCheckTaskApiResponse> {
        return await this.httpService
            .get(this.checkTaskStatusAPI + task_id)
            .pipe(
                map((res: AxiosResponse) => res.data),
                catchError((err) => of({message: err.toString()})),
            )
            .toPromise();
    }

    private publishToAllSubscribers(task: AudioResponseDto) {
        this.subscribers.forEach((sub) => sub(task));
    }

    private scheduleCheckTasksStatus() {
        const wait = () => new Promise((resolve) => setTimeout(resolve, 30000));
        const handler = async () => {
            const queues = this.queues;
            this.queues = [];
            this.isChecking = true;
            const remainTasks: AudioTaskDto[] = [];
            // this.logger.debug('check queue');
            for (let i = 0; i < queues.length; i += 10) {
                const pendingsTasks = queues
                    .slice(i, i + 10)
                    .filter((t) => t.task_id)
                    .map(async (t) => {
                        this.logger.debug('check task: ' + t.task_id);
                        const res = await this.checkTaskStatus(t.task_id)
                        this.logger.debug('task response: ' + JSON.stringify(t))
                        if (res.status === 0 && res.url) {
                            this.logger.debug('task done: ' + res.id);
                            this.publishToAllSubscribers({...t, url: res.url});
                        } else {
                            remainTasks.push(t);
                        }
                    });

                await Promise.all(pendingsTasks);
                // use all instead of allSettled because we want to stop when any failure occurred
            }
            // //update current queues with new one without resolved task
            this.isChecking = false;
            this.queues.push(...remainTasks);
            //
            await wait();
            //
            await handler();
        };
        handler().then((_) => _);
    }

    mergeAudioURLS(task_ids: string[]): Promise<string> {
        const data = new FormData();
        data.append('token', this.token);
        data.append('chunks', task_ids.join(','));
        return this.httpService
            .post<{ status: number; msg: string; url: string }>(this.mergeAPI, data, {
                headers: data.getHeaders(),
            })
            .pipe(
                map((res) => {
                    return res.data;
                }),
                map((res) => {
                    return res.url;
                }),
                catchError((err) => {
                    this.logger.error(err.toString());
                    return '';
                }),
            )
            .toPromise();
    }

    getPendingTasks(): { tasks: number, checking: boolean } {
        return {tasks: this.queues.length, checking: this.isChecking};
    }

    async compressAudioURLS(task_ids: string[]) {
        const data = new FormData();
        data.append('token', this.token);
        data.append('chunks', task_ids.join(','));
        return this.httpService
            .post<{ status: number; msg: string; url: string }>(this.compressAPI, data, {
                headers: data.getHeaders(),
            })
            .pipe(
                map((res) => {
                    return res.data;
                }),
                map((res) => {
                    return res.url;
                }),
                catchError((err) => {
                    this.logger.error(err.toString());
                    return '';
                }),
            )
            .toPromise();
    }
}

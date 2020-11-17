export class AudioTaskDto {
    page_id: number;
    task_id: string;
    voice_id: string;
}

export class AudioPublishDto {
    page_id: number;
    text: string;
    voice_id: string;
}

export class AudioResponseDto extends AudioTaskDto {
    url: string;
}

export class callGetTaskApiResponse {
    status: number;
    id: string;
}

export class callCheckTaskApiResponse {
    id: string;
    msg: string;
    progress: number;
    url: string;
    status: number;
}

export class callInfoResponse {
    'msg': string;
    'status': number;
    'version': string;
    'voices': voice[];
}

export class voice {
    id: string;
    name: string;
}

export class AudioTaskDto {
  page_id: number;
  task_id: string;
}
export class AudioPublishDto {
  page_id: number;
  text: string;
}

export class AudioResponseDto extends AudioTaskDto {
  url: string;
}

export class callGetTaskApiResponse {
  task_id: string;
}

export class callCheckTaskApiResponse {
  url: string;
  status: string;
}

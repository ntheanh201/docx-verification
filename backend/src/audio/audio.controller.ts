import { Controller, Get } from '@nestjs/common';

import { AudioService } from './audio.service';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}
  @Get('voices')
  getVoices() {
    return this.audioService.getVoices();
  }
  @Get('pendings')
  getPendingTasks() {
    return this.audioService.getPendingTasks();
  }
}

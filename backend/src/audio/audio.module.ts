import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AudioService } from './audio.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [AudioService],
  exports: [AudioService],
})
export class AudioModule {}

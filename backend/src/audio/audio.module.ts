import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [AudioService],
  exports: [AudioService],
  controllers: [AudioController],
})
export class AudioModule {}

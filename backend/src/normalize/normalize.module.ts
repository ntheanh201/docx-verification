import { HttpModule, Module } from '@nestjs/common';
import { NormalizeService } from './normalize.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  exports: [NormalizeService],
  providers: [NormalizeService],
})
export class NormalizeModule {}

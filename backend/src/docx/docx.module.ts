import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocxService } from './docx.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [DocxService],
  exports: [DocxService],
})
export class DocxModule {}

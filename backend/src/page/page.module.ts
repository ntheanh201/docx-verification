import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './page.entity';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import './page.profile';
import { AudioModule } from 'src/audio/audio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Page]), AudioModule],
  providers: [PageService],
  controllers: [PageController],
  exports: [PageService],
})
export class PageModule {}

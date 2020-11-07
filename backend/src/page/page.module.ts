import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './page.entity';
import { PageService } from './page.service';

@Module({
  imports: [TypeOrmModule.forFeature([Page])],
  providers: [PageService],
})
export class PageModule {}

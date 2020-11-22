import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Book} from './book.entity';
import {BookService} from './book.service';
import {BookController} from './book.controller';
import {MulterModule} from '@nestjs/platform-express';
import './book.profile';
import {DocxModule} from 'src/docx/docx.module';
import {PageModule} from 'src/page/page.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {uploadDir} from './constant';

@Module({
    imports: [
        TypeOrmModule.forFeature([Book]),
        MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return ({
                    dest: config.get<string>('UPLOAD_DIR') || uploadDir,
                })
            },
        }),
        DocxModule,
        PageModule,
        ConfigModule,
    ],
    providers: [BookService],
    controllers: [BookController],
})
export class BookModule {
}

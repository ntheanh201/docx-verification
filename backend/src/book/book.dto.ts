import {ApiProperty} from '@nestjs/swagger';
import {IsNumberString, Min} from 'class-validator';
import {AutoMap} from '@nartc/automapper';
import {UserVm} from 'src/user/user.dto';

export class BookUploadDto {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

// export class BookGetDto {
//     @IsNumberString()
//     @ApiProperty({example: 0, required: true, default: 0})
//     page: number;
// }

export class BookVm {
    @AutoMap()
    id: number;
    @AutoMap()
    name: string;
    @AutoMap()
    saved_name: string;
    @AutoMap()
    size: number;
    @AutoMap()
    mimetype: string;
    @AutoMap(() => UserVm)
    uploader: UserVm;
    @AutoMap()
    total_pages: number;
    @AutoMap()
    audio_url: string;
    @AutoMap()
    default_voice: string;
    @AutoMap()
    created_at: Date;
}


export class BookMergeDto {
    @Min(0)
    @ApiProperty({example: 1, required: true})
    book_id: number;
}


export class BookCloneDto {
    @Min(0)
    @ApiProperty({example: 1, required: true})
    book_id: number;
    @ApiProperty()
    voice_id: string;
}

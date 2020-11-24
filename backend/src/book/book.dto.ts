import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsNumberString, Min} from 'class-validator';
import {AutoMap} from '@nartc/automapper';
import {UserVm} from 'src/user/user.dto';
import {Type} from 'class-transformer';
import {In} from "typeorm";

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

export class SorterVm {
    field: string;
    order: string;
}


export class FilterVm {
    progress?: string[];
    uploader?: string[];
    default_voice?: string[];
}

export class Sorter {
    field: string;
    order: string;

    Order() {
        if (this.field && (this.order === 'ASC' || this.order === 'DESC')) {
            return {
                [this.field]: this.order
            }
        }
        return {}
    }
}

export class Filter {
    progress?: string[];
    uploader?: string[];
    default_voice?: string[];

    Filter() {
        const that = this;
        let result: any = {}
        console.log(that, "hi")
        Object.keys(that).forEach(key => {
            if (that[key]) {
                if (key === "uploader") {
                    result["uploader.name"] = that[key][0]
                    return
                }
                result[key] = In(that[key])
            }
        })
        return result
    }

    UseBuildQuery() {
        return Array.isArray(this.default_voice)
    }
}

export class BookGetDto {
    @IsNumber()
    @ApiProperty({example: 0, required: true, default: 0})
    page: number;
    @Type(() => FilterVm)
    filters: FilterVm;
    @Type(() => SorterVm)
    sorter: SorterVm;
}

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

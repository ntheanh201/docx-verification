import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, Min, IsNotEmpty, IsIn} from 'class-validator';
import {AutoMap} from '@nartc/automapper';
import {UserVm} from 'src/user/user.dto';
import {Type} from 'class-transformer';
import {In} from 'typeorm';

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

export enum OrderType {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class SorterVm {
    @IsNotEmpty()
    field: string;
    @IsIn([OrderType.ASC, OrderType.DESC])
    order: OrderType;
}

export class FilterVm {
    uploader?: string[];
    default_voice?: string[];
}

export class Sorter {
    field: string;
    order: OrderType;

    Order() {
        if (this.field && (this.order === 'ASC' || this.order === 'DESC')) {
            return {
                [this.field]: this.order,
            };
        }
        return {};
    }

    UseBuildQuery() {
        return this.field === "progress"
    }
}

export class Filter {
    uploader?: string[];
    default_voice?: string[];

    Filter() {
        const that = this;
        let result: any = {};
        Object.keys(that).forEach((key) => {
            if (that[key]) {
                result[key] = In(that[key]);
            }
        });
        return result;
    }

    WhereClause() {
        const filters = {}
        Object.keys(this).forEach(key => {
            if (Array.isArray(this[key])) {
                const i = this[key].reduce((acc, v) => `${acc !== '' ? acc + ', ' : ''} '${v}'`, '')
                filters[key] = ` IN (${i})`
            }
        })
        if (Object.keys(filters).length === 0) {
            return ''
        }

        let where = 'where '

        Object.keys(filters).forEach((key, i) => {
            if (i !== 0) {
                where += 'and '
            }
            where += `${key} ${filters[key]}`
        })

        return where
    }

}

export class BookGetDto {
    @IsNumber()
    @ApiProperty({example: 0, required: true, default: 0})
    page: number;
    @Type(() => FilterVm)
    @ApiProperty()
    filters: FilterVm;
    @IsNotEmpty()
    @ApiProperty({required: true, default: {field: 'created_at', order: 'DESC'}})
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
    compressed_url: string;
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

export class BookCompressDto {
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

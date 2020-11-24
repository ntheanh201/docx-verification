import {AutoMapper, mapFrom, ProfileBase} from '@nartc/automapper';
import {Profile} from 'nestjsx-automapper';

import {Book} from './book.entity';
import {BookVm, Filter, FilterVm, Sorter, SorterVm} from './book.dto';

@Profile()
export class BookProfile extends ProfileBase {
    constructor(mapper: AutoMapper) {
        super();
        mapper
            .createMap(Book, BookVm)
            .forMember(
                (d) => d.saved_name,
                mapFrom((s) => s.saved_name),
            )
            .forMember(
                (d) => d.total_pages,
                mapFrom((d) => d.total_pages),
            )
            .forMember(
                (d) => d.audio_url,
                mapFrom((s) => s.audio_url),
            )
            .forMember(
                (d) => d.default_voice,
                mapFrom((s) => s.default_voice),
            )
            .forMember(
                (d) => d.created_at,
                mapFrom((d) => d.created_at),
            );
    }
}

@Profile()
export class SorterProfile extends ProfileBase {
    constructor(mapper: AutoMapper) {
        super();
        mapper
            .createMap(SorterVm, Sorter)
            .forMember(
                (d) => d.field,
                mapFrom((s) => s.field),
            )
            .forMember(
                (d) => d.order,
                mapFrom((s) => s.order),
            );
    }
}

@Profile()
export class FilterProfile extends ProfileBase {
    constructor(mapper: AutoMapper) {
        super();
        mapper
            .createMap(FilterVm, Filter)
            .forMember(
                (d) => d.progress,
                mapFrom((s) => s.progress),
            )
            .forMember(
                (d) => d.default_voice,
                mapFrom((s) => s.default_voice),
            )
            .forMember(
                (d) => d.uploader,
                mapFrom((s) => s.uploader),
            );
    }
}

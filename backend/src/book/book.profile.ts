import {AutoMapper, mapFrom, ProfileBase} from '@nartc/automapper';
import {Profile} from 'nestjsx-automapper';

import {Book} from './book.entity';
import {BookVm} from './book.dto';

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
            ).forMember(d => d.audio_url, mapFrom((s) => s.audio_url));
    }
}

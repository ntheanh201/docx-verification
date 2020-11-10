import { AutoMapper, mapFrom, ProfileBase } from '@nartc/automapper';
import { Profile } from 'nestjsx-automapper';
import { PageVm } from './page.dto';
import { Page } from './page.entity';

@Profile()
export class PageProfile extends ProfileBase {
  constructor(mapper: AutoMapper) {
    super();
    mapper
      .createMap(Page, PageVm)
      .forMember(
        (d) => d.id,
        mapFrom((s) => s.id),
      )
      .forMember(
        (d) => d.book_id,
        mapFrom((s) => s.book_id),
      )
      .forMember(
        (d) => d.page_num,
        mapFrom((s) => s.page_num),
      )
      .forMember(
        (d) => d.text_raw,
        mapFrom((s) => s.text_raw),
      )
      .forMember(
        (d) => d.text_norm,
        mapFrom((s) => s.text_norm),
      )
      .forMember(
        (d) => d.task_id,
        mapFrom((s) => s.task_id),
      );
  }
}

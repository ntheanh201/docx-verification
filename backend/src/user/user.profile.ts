import { AutoMapper, ProfileBase } from '@nartc/automapper';
import { Profile } from 'nestjsx-automapper';
import { UserVm } from './user.dto';
import { User } from './user.entity';

@Profile()
export class UserProfile extends ProfileBase {
  constructor(mapper: AutoMapper) {
    super();
    mapper.createMap(User, UserVm);
  }
}

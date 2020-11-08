import { AutoMap } from 'nestjsx-automapper';

export class CreateUserDto {
  username: string;
  name: string;
  password: string;
}

export class UserVm {
  @AutoMap()
  id: number;

  @AutoMap()
  username: string;

  @AutoMap()
  name: string;
}

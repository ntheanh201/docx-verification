import { AutoMapper } from '@nartc/automapper';
import { InjectMapper } from 'nestjsx-automapper';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from 'src/user/user.service';

import { AuthRegisterDto } from './auth.dto';
import { UserVm } from 'src/user/user.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    @InjectMapper() private mapper: AutoMapper,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByUsername(username);
      if (await bcrypt.compare(password, user.password)) {
        return this.mapper.map(user, UserVm, User);
      }
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    } catch (e) {
      this.logger.error(e);
      /* handle error */
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async login(user: any) {
    try {
      const { password, ...payload } = await this.userService.findByUsername(
        user.username,
      );

      return { access_token: this.jwtService.sign(payload) };
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async register(data: AuthRegisterDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    try {
      const createdUser = await this.userService.create({
        ...data,
        password: hashedPassword,
      });
      return this.mapper.map(createdUser, UserVm, User);
    } catch (e) {
      this.logger.error(e);
      /* handle error */
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from 'src/user/user.service';

import { AuthRegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByUsername(username);
      if (await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result;
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
      createdUser.password = undefined;
      return createdUser;
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

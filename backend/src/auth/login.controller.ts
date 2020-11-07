import {
  Controller,
  Post,
  Request,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { AuthLoginDto, AuthRegisterDto } from './auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
@ApiBearerAuth()
export class LoginController {
  constructor(private authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req: any, @Body() _: AuthLoginDto) {
    return this.authService.login(req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
  @Post('auth/register')
  register(@Body() body: AuthRegisterDto) {
    return this.authService.register(body);
  }
}

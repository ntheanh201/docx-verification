import { ApiProperty } from '@nestjs/swagger';
import { MinLength, MaxLength } from 'class-validator';

export class AuthRegisterDto {
  @MinLength(0)
  @MaxLength(100)
  @ApiProperty({ example: 'username001', required: true })
  username: string;
  @MinLength(0)
  @MaxLength(100)
  @ApiProperty({ example: 'password001', required: true })
  password: string;
  @MinLength(0)
  @MaxLength(100)
  @ApiProperty({ example: 'username001', required: true })
  name: string;
}

export class AuthLoginDto {
  @MinLength(0)
  @MaxLength(100)
  @ApiProperty({ example: 'username001', required: true })
  username: string;
  @MinLength(0)
  @MaxLength(100)
  @ApiProperty({ example: 'password001', required: true })
  password: string;
}

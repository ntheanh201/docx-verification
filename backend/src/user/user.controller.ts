import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {UserService} from "./user.service";
import {ApiBearerAuth, ApiBody} from "@nestjs/swagger";
import {AutoMapper} from "@nartc/automapper";
import {UserVm} from "./user.dto";
import {User} from "./user.entity";
import {InjectMapper} from "nestjsx-automapper";

@Controller('users')
@ApiBearerAuth()
export class UserController {
    constructor(private readonly service: UserService, @InjectMapper() private readonly mapper: AutoMapper) {
    }

    @UseGuards(JwtAuthGuard)
    @Post('search')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: {type: 'string'},
            },
        },
    })
    async searchByName(@Body('name')name: string) {
        if (!name) {
            return []
        }
        const users = await this.service.search(name)
        return this.mapper.mapArray(users, UserVm, User)

    }
}

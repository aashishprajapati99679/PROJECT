import { Body, Controller, Post } from '@nestjs/common';
import { UserRegistationDto } from './dto/userRegistationDto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
    constructor(private readonly userService : UsersService){}
    @Post('register')
    async registerUserController(@Body() userRegistationDto : UserRegistationDto){
        return await this.userService.registerUser(userRegistationDto)
    }
}

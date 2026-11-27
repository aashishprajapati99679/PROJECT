import { Body, Controller, Post } from '@nestjs/common';
import { UserRegistationDto } from './dto/userRegistationDto.js';
import { UsersService } from './users.service.js';
import { VerifyOtpDto } from '../sms/verifyotpDto.js';
import { UserLoginDto } from './dto/userLoginDto.js';

@Controller('auth')
export class UsersController {
    constructor(private readonly userService : UsersService){}
    @Post('register')
    async register(@Body() userData : UserRegistationDto){
        return await this.userService.registerUser(userData);
    }

    @Post('verify-otp')
    async verifyOtp(@Body() verifydata : VerifyOtpDto){
        return this.userService.verifyOtp(verifydata);
    }

    @Post('login')
    async login(@Body() userLoginDto : UserLoginDto){
        return this.userService.loginUser(userLoginDto);
    }
}

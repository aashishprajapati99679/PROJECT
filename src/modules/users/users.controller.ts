import { Body, Controller, Post } from '@nestjs/common';
import { UserRegistationDto } from './dto/userRegistationDto.js';
import { UsersService } from './users.service.js';
import { VerifyOtpDto } from '../sms/verifyotpDto.js';

@Controller('auth/register')
export class UsersController {
    constructor(private readonly userService : UsersService){}
    @Post('send-otp')
    async register(@Body() userData : UserRegistationDto){
        return await this.userService.registerUser(userData);
    }

    @Post('verify-otp')
    async verifyOtp(@Body() verifydata : VerifyOtpDto){
        return this.userService.verifyOtp(verifydata);
    }
}

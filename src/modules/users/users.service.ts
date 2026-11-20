import {
    Injectable,
    Inject,
    ConflictException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';
import {Redis} from 'ioredis';

import {
    createHmac,
    timingSafeEqual,
} from 'crypto';

import * as bcrypt from 'bcrypt';

import { REDIS_CLIENT } from '../../redis/redis.provider.js';
import { SmsService } from '../sms/sms.service.js';

import { UserRegistationDto } from './dto/userRegistationDto.js';
import { VerifyOtpDto } from '../sms/verifyotpDto.js';


@Injectable()
export class UsersService {
    constructor(
        private readonly dataSource : DataSource,
        @Inject(REDIS_CLIENT)
        private readonly redis : Redis,
        private readonly smsService : SmsService
    ){}


    // Hash the OTP
    private hashOtp(otp : string ):string{
        const secret = process.env.OTP_SECRET;
        if(!secret){
            throw new InternalServerErrorException("OPT secret key not found!!");
        }
          return createHmac('sha256', secret).update(otp).digest('hex');
    }

    private compareOtp(otp : string, storehash : string):boolean{
        const hashed = this.hashOtp(otp);
        const currentBuffer = Buffer.from(hashed, 'hex');
        const storedBuffer = Buffer.from(storehash, 'hex');

        if (currentBuffer.length !== storedBuffer.length) {
            return false;
        }

        return timingSafeEqual(
            currentBuffer,
            storedBuffer,
        );
    }

    async registerUser(userRegistationDto : UserRegistationDto){
        
        const { fname , lname , mobileno , email , password } = userRegistationDto;

        if(!userRegistationDto.lname || !userRegistationDto.email || !userRegistationDto.fname || !userRegistationDto.mobileno || !userRegistationDto.mobileno){
            throw new Error("All Filed are required!!");
        }

        const isExisting: Array<{ email: string; mobileno: string }> = await this.dataSource.query(`SELECT * FROM "user" WHERE email = $1 OR mobileno = $2` , [userRegistationDto.email , userRegistationDto.mobileno]);
         if (isExisting.length > 0) {

            if (isExisting.some(user => user.email === email)) {
                throw new ConflictException(
                    'Email already registered',
                );
            }

            if (
                isExisting.some( user => user.mobileno === mobileno,)
            ) {
                throw new ConflictException(
                    'Mobile number already registered',
                );
            }
        }

        //cool down 
        const cooldownKey = `otp:cooldown:${userRegistationDto.mobileno}`;
        const cooldown = await this.redis.set(cooldownKey , '1' ,'EX' , 60 , 'NX');
        if(!cooldown){
            throw new Error("To many Request plesae wait 60 sec!!")
        };

        const redisKey = `otp:register:${userRegistationDto.mobileno}`
        try {
            const otp = this.smsService.generateOtp();
            const hashPassword = await bcrypt.hash(userRegistationDto.password , 10);            
            const otpHash = this.hashOtp(otp);

            const pendingData = { fname , lname , mobileno  ,email , password: hashPassword, otpHash };
            await this.redis.set(redisKey , JSON.stringify(pendingData) , 'EX' , 600);

            // 7. Reset old attempts
            await this.redis.del(`otp:attempts:${mobileno}`);
            const sentOtp = await this.smsService.sendOtp(mobileno , otp);

            if(!sentOtp){
                await this.redis.del(redisKey);

                await this.redis.del(cooldownKey);

                throw new InternalServerErrorException(
                    'Unable to send OTP. Please try again.',
                );
            }

             return {
                success: true,
                message: 'OTP sent successfully',
                expiresIn: 600,
                resendAfter: 60,
            };

        } catch (error) {
            await this.redis.del(redisKey);
            await this.redis.del(cooldownKey);

            throw error;
        }

    }

    async verifyOtp(verifyOtpDto : VerifyOtpDto){
        const { mobileno , otp } = verifyOtpDto;
        const redisKey = `otp:register:${mobileno}`;
        const attemptsKey = `otp:attempts:${mobileno}`;
        const pendingdata = await this.redis.get(redisKey);

         if (!pendingdata) {

            throw new BadRequestException(
                'OTP expired or registration not found',
            );
        }

        const attempt = await this.redis.incr(attemptsKey)
        if (attempt === 1) {
            await this.redis.expire(attemptsKey, 600);
        }
        if (attempt > 5) {

            await this.redis.del(redisKey);
            await this.redis.del(attemptsKey);
            await this.redis.del(`otp:cooldown:${mobileno}`);

            throw new Error(
                'Maximum OTP attempts exceeded. Please request a new OTP.',
            );
        }

        const registation = JSON.parse(pendingdata);
         if (!this.compareOtp(otp, registation.otpHash)) {

            throw new BadRequestException(
                `Invalid OTP. ${5 - attempt} attempts remaining`,
            );
        }
        try {
                const result = await this.dataSource.query(`INSERT INTO "user" (fname, lname, mobileno, email, password) VALUES ($1 , $2 , $3 , $4 , $5) RETURNING id , fname , lname , mobileno , email , "createdAt"`, [registation.fname , registation.lname , registation.mobileno , registation.email , registation.password]);
                // 6. Delete temporary Redis records
            await this.redis.del(redisKey);

            await this.redis.del(attemptsKey);

            await this.redis.del(
                `otp:cooldown:${mobileno}`,
            );
             return {
                success: true,
                message: 'Registration successful',
                user: result[0],
            };

            
        } catch (error) {
            
         const dbError = error as { code?: string };

            if (dbError.code === '23505') {

                await this.redis.del(redisKey);
                await this.redis.del(attemptsKey);

                throw new ConflictException(
                    'Email or mobile number already registered',
                );
            }

            throw error;
        }
    }
}
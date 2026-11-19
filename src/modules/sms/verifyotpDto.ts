import {
    IsNotEmpty,
    IsString,
    Matches,
} from 'class-validator';

export class VerifyOtpDto {
    @IsString()
    @Matches(/^[0-9]{10}$/)
    mobileno: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9]{6}$/, {
        message: 'OTP must contain exactly 6 digits',
    })
    otp: string;
}
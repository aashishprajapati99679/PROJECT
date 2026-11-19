import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UserRegistationDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    fname: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lname: string;

    @IsString()
    @Matches(/^[0-9]{10}$/, {
        message: 'Mobile number must contain exactly 10 digits',
    })
    mobileno: string;

    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password: string;
}
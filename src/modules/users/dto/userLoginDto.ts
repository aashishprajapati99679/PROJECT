import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class UserLoginDto {
    @IsEmail()
    @MaxLength(100)
    email : string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password : string
}
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRigestration } from './entities/user.register.entities.js';
import { DataSource, type Repository } from 'typeorm';
import { UserRegistationDto } from './dto/userRegistationDto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserRigestration) private readonly regRepositres : Repository<UserRigestration> , 
        private dataSource : DataSource,
    ){}

    async registerUser(userRegistationDto : UserRegistationDto){
        //check the user alredy exist or not 
        const exitingUser = await this.dataSource.query(`SELECT * FROM "user" WHERE email = $1 OR mobileno = $2`, [userRegistationDto.email , userRegistationDto.mobileno]);

        if(exitingUser.length > 0){
             throw new ConflictException('Email or mobile number already registered');
        }

        //Hash the Password before saving
        const hashPassword = await bcrypt.hash(userRegistationDto.password , 10);

        const result = await this.dataSource.query(
            `INSERT INTO "user" (fname , lname , mobileno , email , password) VALUES ($1 , $2 ,$3 ,$4 ,$5) RETURNING id, fname, lname, "mobileno", email, "createdAt"` , [userRegistationDto.fname , userRegistationDto.lname , userRegistationDto.mobileno , userRegistationDto.email , hashPassword]
        )

        return { message : 'User has Register successfully' , user : result[0]}

    }
}

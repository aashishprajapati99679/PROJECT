import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UserRigestration } from './entities/user.register.entities.js';
import { SmsModule } from '../sms/sms.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports : [TypeOrmModule.forFeature([UserRigestration]), SmsModule , ConfigModule , JwtModule.registerAsync({imports : [ConfigModule] , inject : [ConfigService] , useFactory : (configService : ConfigService) => ({secret : configService.get<string>('JWT_SECRET'), signOptions : {expiresIn : '30m'},}),}),],
  controllers: [UsersController],
  providers: [UsersService],
  exports : [UsersService]
})
export class UsersModule {}

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UserRigestration } from './entities/user.register.entities.js';
import { SmsModule } from '../sms/sms.module.js';

@Module({
  imports : [TypeOrmModule.forFeature([UserRigestration]), SmsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports : [UsersService]
})
export class UsersModule {}

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UserRigestration } from './entities/user.register.entities.js';

@Module({
  imports : [TypeOrmModule.forFeature([UserRigestration])],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}

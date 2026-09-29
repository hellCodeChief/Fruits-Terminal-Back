import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { RoleEntity } from '../role/role.entity';
import { PropertyEntity } from './property.entity';
import { PropertyService } from './property.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyEntity, UserEntity, RoleEntity])],
  controllers: [PropertyController],
  providers: [PropertyService, UserService],
})
export class PropertyModule { }

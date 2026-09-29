import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from '../permission/permission.entity';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([RoleEntity, PermissionEntity, UserEntity])
    ],
    controllers: [RoleController],
    providers: [RoleService, UserService],
})
export class RoleModule { }

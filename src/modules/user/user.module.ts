import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from '../role/role.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }

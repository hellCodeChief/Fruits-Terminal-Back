import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwt/constants';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth.guard';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { RoleEntity } from '../role/role.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            global: true, // we can use it in every module
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '8h' },
        }),
        TypeOrmModule.forFeature([UserEntity, RoleEntity]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        UserService,
        // apply authorization guard at all the controllers of this module
        // {
        //     provide: APP_GUARD,
        //     useClass: AuthGuard
        // }
    ],
    exports: [AuthService],
})
export class AuthModule { }
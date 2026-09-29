import {
    BadRequestException,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import HashClass from 'src/common/utils/crypto.util';
import { LoginDTO } from 'src/modules/auth/dtos/login.dto';
import { UserEntity } from 'src/modules/user/user.entity';
import { Payload } from './types';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    async validateUser(loginBody: LoginDTO): Promise<{ access_token: string }> {
        try {
            const { email, phone, password } = loginBody;
            let user: Pick<UserEntity, 'id' | 'isActive' | 'password' | 'salt'>;

            if (email) {
                user = await this.userService.findOneByEmail(email);
            } else if (phone) {
                user = await this.userService.findOneByPhone(phone);
            } else {
                throw new BadRequestException(`email یا phone باید وارد شود`);
            }

            if (!user) throw new ForbiddenException(`کاربر یافت نشد`);

            const { id, isActive } = user;
            if (!isActive) throw new BadRequestException(`حساب کاربری غیرفعال است`);

            const is_password_match = HashClass.register(password, user.password, user.salt);
            if (!is_password_match)
                throw new BadRequestException(`رمز عبور نادرست است`);

            const token = await this.createToken(id);
            await this.userService.updateToken(id, token);

            return { access_token: token };
        } catch (error) {
            throw new HttpException(`${error}`, HttpStatus.EXPECTATION_FAILED);
        }
    }

    async createToken(id: string): Promise<string> {
        const payload: Payload = { sub: id };
        return await this.jwtService.signAsync(payload, {
            expiresIn: '8h',
        });
    }

    async logout(user: UserEntity) {
        try {
            await this.userService.updateToken(user.id, null);
            return {
                status: 'success',
                message: 'user logout successfully',
            };
        } catch {
            throw new BadRequestException("can't logout");
        }
    }
}

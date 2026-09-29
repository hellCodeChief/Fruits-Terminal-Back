import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../jwt/constants';
import { Request } from 'express';
import { Payload } from '../types';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) { };

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException();

        try {
            const payload: Payload = await this.jwtService.verifyAsync(token, {
                secret: jwtConstants.secret,
            });

            // Fetch full user from database (you can select specific fields if needed)
            const user = await this.userService.findById(payload.sub);
            if (!user) throw new UnauthorizedException();

            request['user'] = user; // Attach full user object to request
        } catch (err) {
            throw new UnauthorizedException();
        };

        return true;
    };

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    };
};
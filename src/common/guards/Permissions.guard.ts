import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/Permissions.decorator';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly userService: UserService,
    ) { };

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // The route is open
        if (!requiredPermissions || requiredPermissions.length === 0)
            return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Pass if user is GodMode
        const isGodMode = await this.userService.find({
            email: process.env.USER_EMAIL,
            phone: process.env.USER_PHONE,
        });
        if (isGodMode)
            return true;

        if (!user)
            throw new ForbiddenException('User not authenticated');

        const userPermissions = user.roles
            .flatMap(role => role.permissions || [])
            .map(perm => perm.name);

        // Check the permission
        const hasPermission = requiredPermissions.some(perm => userPermissions.includes(perm));

        if (!hasPermission)
            throw new ForbiddenException('شما دسترسی لازم را ندارید');

        return true;
    };
};

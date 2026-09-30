import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

const STAFF_ROLES = new Set(['admin', 'worker']);

@Injectable()
export class StallStaffGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    if (!user) throw new ForbiddenException('شما دسترسی لازم را ندارید');

    if (user.accountType === 'admin') return true;

    const names = (user.roles ?? []).map((role) =>
      String(role?.name ?? '')
        .trim()
        .toLowerCase(),
    );
    if (names.some((name) => STAFF_ROLES.has(name))) return true;

    throw new ForbiddenException('فقط مدیر یا کارگر می‌تواند در ویترین ثبت کند');
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/common/decorators/Permissions.decorator';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { PermissionsGuard } from 'src/common/guards/Permissions.guard';
import { PermissionService } from './permission.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('permission')
@ApiBearerAuth('access-token')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  //   @Permissions('product:read')
  async findAll() {
    return await this.permissionService.findAll();
  }
}

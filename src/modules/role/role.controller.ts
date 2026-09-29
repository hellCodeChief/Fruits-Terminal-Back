import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CurrentUser } from 'src/common/decorators/CurrentUser.decorator';
import { UserEntity } from 'src/modules/user/user.entity';
import { Permissions } from 'src/common/decorators/Permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/Permissions.guard';
import { RoleService } from './role.service';
import { RoleInsertDTO } from './dtos/RoleInsert.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('role')
@ApiBearerAuth('access-token')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('role:create')
  async insertRole(@Body() payload: RoleInsertDTO) {
    return this.roleService.insert(payload);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Body() payload: RoleInsertDTO, @Param('id') id: string) {
    return this.roleService.update(payload, id);
  }

  @Get()
  async findAll() {
    return this.roleService.findAll();
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.roleService.delete(id);
  }

  @UseGuards(AuthGuard)
  @Get('currenPermissions')
  async currentPermissions(@CurrentUser() user: UserEntity) {
    const userId = user.id;
    return this.roleService.currentPermissions(userId);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CurrentUser } from 'src/common/decorators/CurrentUser.decorator';
import { PermissionsGuard } from 'src/common/guards/Permissions.guard';
import { Permissions } from 'src/common/decorators/Permissions.decorator';
import { UserService } from './user.service';
import { UserInsertDTO } from './dtos/UserInsert.dto';
import { UserEntity } from './user.entity';
import { ChangePasswordDTO } from './dtos/UserChangePassword.dto';
import { UserUpdateDTO } from './dtos/UserUpdate.dto';
import { AssignRoleDTO } from './dtos/AssignRole.dto';
import { UserSearchDTO } from './dtos/UserSearch.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async signup(@Body() userInsertData: UserInsertDTO) {
    return await this.userService.insertUser(userInsertData);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: UserEntity) {
    return await this.userService.findById(user.id);
  }

  @UseGuards(AuthGuard)
  @Get('all')
  async findAll() {
    return await this.userService.findAll();
  }

  @UseGuards(AuthGuard)
  @Put('change-password')
  async changePassword(
    @CurrentUser() user: UserEntity,
    @Body() payload: ChangePasswordDTO,
  ) {
    const { newPassword } = payload;
    return await this.userService.changePassword(user.id, newPassword);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateUser(
    @Body() userUpdateData: UserUpdateDTO,
    @Param('id') id: string,
  ) {
    return await this.userService.updateUser(userUpdateData, id);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('user:role-assign')
  @Patch('assign-role/:id')
  async assignRole(
    @Body() assignRoleData: AssignRoleDTO,
    @Param('id') id: string,
  ) {
    return await this.userService.assignRole(assignRoleData, id);
  }

  @UseGuards(AuthGuard)
  @Delete()
  async remove(@CurrentUser() user: UserEntity) {
    return await this.userService.delete(user.id);
  }

  @UseGuards(AuthGuard)
  @Get('search')
  async find(@Query() searchQuery: UserSearchDTO) {
    return await this.userService.find(searchQuery);
  }
}

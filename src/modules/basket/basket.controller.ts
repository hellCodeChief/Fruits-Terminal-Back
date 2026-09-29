
import { Controller, Get, Param, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { PermissionsGuard } from 'src/common/guards/Permissions.guard';
import { Permissions } from 'src/common/decorators/Permissions.decorator';
import { BasketService } from './basket.service';
import { BasketInsertDTO } from './dtos/createBasket.dto';
import { CurrentUser } from 'src/common/decorators/CurrentUser.decorator';
import { UserEntity } from 'src/modules/user/user.entity';
import { BasketListFilterDTO } from './dtos/basketListFilter.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('basket')
@ApiBearerAuth('access-token')
export class BasketController {
  constructor(private readonly basketService: BasketService) { };

  @Get()
  @Permissions('basket:read')
  async findAll(@Query() filters: BasketListFilterDTO) {
    return await this.basketService.findAll(filters);
  };

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.basketService.findOne(id);
  };

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  async create(@Body() payload: BasketInsertDTO, @CurrentUser() user: UserEntity) {
    return await this.basketService.syncBasket(payload, user.id);
  };

  @Get('checkout/:basketId')
  @UseGuards(AuthGuard, PermissionsGuard)
  async checkout(@Param('basketId') basketId: string, @CurrentUser() user: UserEntity) {
    return await this.basketService.checkout(basketId, user.id);
  };
};


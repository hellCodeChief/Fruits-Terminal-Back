
import { Controller, Get, Param, Post, Body, UseGuards, Put, Delete } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyInsertDTO } from './dtos/propertyInsert.dto'
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { PermissionsGuard } from 'src/common/guards/Permissions.guard';
import { Permissions } from 'src/common/decorators/Permissions.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('property')
@ApiBearerAuth('access-token')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { };
  
  @Get()
  async findAll() {
    return await this.propertyService.findAll();
  };

  @Get('/:id')
  async findOne(@Param('id') id: number) {
      return await this.propertyService.findOne(id);
  };

  @UseGuards(AuthGuard, PermissionsGuard)
  @Post()
  @Permissions('property:create')
  async create(@Body() payload: PropertyInsertDTO) {
    return await this.propertyService.insert(payload);
  };

  @Put(':id')
  @Permissions('property:update')
  async update(@Param('id') id: number, @Body() payload: PropertyInsertDTO) {
    return await this.propertyService.update(id, payload);
  };

  @Delete(':id')
  @Permissions('property:delete')
  async delete(@Param('id') id: number) {
    return await this.propertyService.delete(id);
  };
};


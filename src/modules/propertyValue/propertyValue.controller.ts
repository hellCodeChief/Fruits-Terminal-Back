import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from 'src/common/guards/Permissions.guard';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { Permissions } from 'src/common/decorators/Permissions.decorator';
import { PropertyValueService } from './propertyValue.service';
import { PropertyValueInsertDTO } from './dtos/propertyValueInsert.dto';
import { PropertyValueUpdateDTO } from './dtos/propertyValueUpdate.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('property-value')
@ApiBearerAuth('access-token')
export class PropertyValueController {
    constructor(private readonly propertyValueService: PropertyValueService) { };

    @Get()
    @Permissions('property-value:read')
    async findAll() {
        return await this.propertyValueService.findAll();
    };

    @Get(':id')
    @Permissions('property-value:read-one')
    async findOne(@Param('id') id: number) {
        return await this.propertyValueService.findOne(id);
    };

    @Post()
    @Permissions('property-value:create')
    async insert(@Body() payload: PropertyValueInsertDTO) {
        return await this.propertyValueService.insert(payload);
    };

    @Put(':id')
    @Permissions('property-value:update')
    async update(@Param('id') id: number, @Body() payload: PropertyValueUpdateDTO) {
        return await this.propertyValueService.update(id, payload);
    };

    @Delete(':id')
    @Permissions('property-value:delete')
    async delete(@Param('id') id: number) {
        return await this.propertyValueService.delete(id);
    };
};

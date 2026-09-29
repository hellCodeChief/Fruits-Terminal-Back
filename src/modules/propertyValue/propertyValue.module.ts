import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyValueEntity } from './propertyValue.entity';
import { PropertyValueController } from './propertyValue.controller';
import { PropertyValueService } from './propertyValue.service';

@Module({
    imports: [TypeOrmModule.forFeature([PropertyValueEntity])],
    controllers: [PropertyValueController],
    providers: [PropertyValueService],
    exports: [PropertyValueService],
})
export class PropertyValueModule { }

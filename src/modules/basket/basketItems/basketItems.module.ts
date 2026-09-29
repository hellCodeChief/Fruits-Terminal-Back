import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketItemsEntity } from './basketItems.entity';


@Module({
    imports: [TypeOrmModule.forFeature([BasketItemsEntity])],
    providers: [],
    controllers: []
})
export class BasketItemsModule { };
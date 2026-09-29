import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketEntity } from './basket.entity';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { UserEntity } from '../user/user.entity';
import { InvoiceEntity } from '../invoice/invoice.entity';
import { InvoiceDetail } from '../invoice/invoiceDetails/invoiceDetails.entity';
import { BasketItemsModule } from './basketItems/basketItems.module';
import { BasketItemsEntity } from './basketItems/basketItems.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([BasketEntity, UserEntity, InvoiceEntity, InvoiceDetail, BasketItemsEntity]),
    BasketItemsModule,
  ],
  providers: [BasketService],
  controllers: [BasketController],
  exports: [BasketItemsModule]
})
export class BasketModule { };
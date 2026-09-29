import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './payment.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ZarinpalGateway } from './gateways/zarinpal/zarinpal.gateway';
import { InvoiceEntity } from '../invoice/invoice.entity';


@Module({
    imports: [TypeOrmModule.forFeature([PaymentEntity, InvoiceEntity])],
    providers: [PaymentService, ZarinpalGateway],
    controllers: [PaymentController]
})
export class PaymentModule { };
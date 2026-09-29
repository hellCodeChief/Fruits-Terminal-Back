import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity } from './invoice.entity';
import { InvoiceDetailsModule } from './invoiceDetails/invoiceDetails.module';


@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceEntity]),
    InvoiceDetailsModule,
  ],
  providers: [],
  controllers: [],
  exports: [InvoiceDetailsModule]
})
export class InvoiceModule { };
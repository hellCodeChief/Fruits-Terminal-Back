import { Injectable } from "@nestjs/common";
import { InvoiceStatusEnum, PaymentMethodEnum } from "../invoice/invoice.enum";
import { PaymentProviderEnum, PaymentStatusEnum } from "./payment.enum";
import { PaymentGateway } from "./gateways/abstract.gateway";
import { ZarinpalGateway } from "./gateways/zarinpal/zarinpal.gateway";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentEntity } from "./payment.entity";
import { Repository } from "typeorm";
import { InvoiceEntity } from "../invoice/invoice.entity";

@Injectable()
export class PaymentService {
    private gateways: Record<string, PaymentGateway> = {};

    constructor(
        private zarinpal: ZarinpalGateway,
        @InjectRepository(PaymentEntity)
        private readonly paymentRepo: Repository<PaymentEntity>,
        @InjectRepository(InvoiceEntity)
        private readonly invoiceRepo: Repository<InvoiceEntity>,
    ) {
        this.gateways['zarinpal'] = zarinpal;
    }

    private getGateway(provider: PaymentProviderEnum): PaymentGateway {
        const gateway = this.gateways[provider.toLowerCase()];
        if (!gateway) throw new Error('درگاه پرداخت پشتیبانی نمی‌شود');
        return gateway;
    }

    async request(invoiceId: string, provider: PaymentProviderEnum, amount: number, callbackUrl: string) {
        console.log({ callbackUrl });
        const gateway = this.getGateway(provider);

        const payment = this.paymentRepo.create({
            invoiceId,
            provider,
            amount: amount,
            status: PaymentStatusEnum.PENDING,
            requestedAt: new Date(),
        });
        await this.paymentRepo.save(payment);

        console.log('beforeeeee request paymentttttttt');
        const { authority, paymentUrl } = await gateway.requestPayment(invoiceId, amount, callbackUrl);
        console.log({ authority });

        payment.authority = authority;
        await this.paymentRepo.save(payment);
        console.log({ payment });

        return { paymentUrl, paymentId: payment.id };
    }

    async verify(provider: PaymentProviderEnum, queryParams: any) {
        console.log('callback called:', { queryParams });
        console.log({ provider });
        const { Authority, RefID } = queryParams;
        const gateway = this.getGateway(provider);

        const payment = await this.paymentRepo.findOne({ where: { authority: Authority, status: PaymentStatusEnum.PENDING } });
        console.log({ payment });
        if (!payment) throw new Error('پرداخت یافت نشد');

        console.log('beforeeee verify paymenttttttttt');
        const verifyResult = await gateway.verifyPayment(Authority, +payment.amount, RefID);
        console.log({ verifyResult });

        if (verifyResult.success) {
            payment.status = PaymentStatusEnum.VERIFIED;
            payment.refId = verifyResult.trackingCode;
            payment.verifiedAt = new Date();
            payment.responseData = JSON.stringify(verifyResult);

            const invoice = await this.invoiceRepo.findOne({ where: { id: payment.invoiceId } });
            invoice.status = InvoiceStatusEnum.PAID;
            invoice.paidAt = new Date().toISOString();
            invoice.paymentMethod = PaymentMethodEnum.CREDIT;
            await this.invoiceRepo.save(invoice);
        } else {
            payment.status = PaymentStatusEnum.FAILED;
            payment.responseData = verifyResult.message;
        }

        await this.paymentRepo.save(payment);

        return verifyResult;
    }
}
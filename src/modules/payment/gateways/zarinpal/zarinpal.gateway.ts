import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaymentGateway } from '../abstract.gateway';

@Injectable()
export class ZarinpalGateway implements PaymentGateway {
    private readonly merchantId = process.env.ZARINPAL_MERCHANT_ID; // ????
    private readonly sandbox = process.env.ZARINPAL_SANDBOX === 'true';
    private readonly baseUrl = this.sandbox
        ? 'https://sandbox.zarinpal.com/pg/rest/WebGate/'
        : 'https://api.zarinpal.com/pg/v4/payment/';

    async requestPayment(invoiceId: string, amount: number, callbackUrl: string, description = 'پرداخت فاکتور') {
        console.log('[Zarinpal requestPaymentttttttt]');

        const response = await axios.post(`${this.baseUrl}request.json`, {
            merchant_id: this.merchantId,
            amount, // Rial
            callback_url: callbackUrl,
            description: `${description} - فاکتور ${invoiceId}`,
        });
        console.log('[Zarinpal requestPaymentttttttt] response.data.data:', response.data.data);

        if (response.data.data.code !== 100) {
            throw new Error('خطا در درخواست پرداخت زرین‌پال');
        }

        const authority = response.data.data.authority;
        const paymentUrl = this.sandbox
            ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
            : `https://www.zarinpal.com/pg/StartPay/${authority}`;

        console.log('[Zarinpal requestPaymentttttttt]', { authority });
        console.log('[Zarinpal requestPaymentttttttt]', { paymentUrl });
        return { authority, paymentUrl };
    }

    async verifyPayment(authority: string, amount: number) {
        console.log('[Zarinpal verifyPaymenttttttttttt]');
        const response = await axios.post(`${this.baseUrl}verify.json`, {
            merchant_id: this.merchantId,
            authority,
            amount,
        });
        console.log('[inside Zarinpal verifyPaymenttttttttttt] response.data.data:', response.data.data);

        const success = response.data.data.code === 100 || response.data.data.code === 101;
        console.log('[inside Zarinpal verifyPaymenttttttttttt]', success);
        return {
            success,
            trackingCode: response.data.data.ref_id?.toString(),
            cardPan: response.data.data.card_pan,
            message: response.data.data.message,
        };
    }
}
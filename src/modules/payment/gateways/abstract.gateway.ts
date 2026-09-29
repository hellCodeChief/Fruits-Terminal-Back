export interface PaymentGateway {
  requestPayment(invoiceId: string, amount: number, callbackUrl: string, description?: string): Promise<{
    authority: string;
    paymentUrl: string;
  }>;

  verifyPayment(authority: string, amount: number, refId?: string): Promise<{
    success: boolean;
    trackingCode?: string;
    cardPan?: string;
    message?: string;
  }>;
}
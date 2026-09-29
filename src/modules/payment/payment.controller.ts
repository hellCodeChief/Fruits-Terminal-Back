import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaymentProviderEnum } from './payment.enum';

@Controller('payment')
// @ApiBearerAuth('access-token')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('request')
  async request(@Body() dto: any, @Req() req) {
    console.log('[request] protocol', req.protocol);
    console.log('[request] host', req.host);
    console.log('[request]', { dto });
    const callbackUrl = `${req.protocol}://${req.headers.host}/payment/callback/${dto.provider}`;
    console.log('[request]', { callbackUrl });

    return this.paymentService.request(
      dto.invoiceId,
      dto.provider,
      dto.amount,
      callbackUrl,
    );
  }

  @Get('callback/:provider')
  async callback(
    @Param('provider') provider: PaymentProviderEnum,
    @Query() query,
    @Res() res,
  ) {
    console.log('[callback]', { provider });
    console.log('[callback]', { query });
    const result = await this.paymentService.verify(provider, query);
    console.log('[callback]', { result });

    if (result.success) {
      return res.redirect('/payment/success');
    } else {
      return res.redirect('/payment/failed');
    }
  }
}

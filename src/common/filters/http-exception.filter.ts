import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Default to internal server error
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorType = 'GeneralError';

    // Prepare base payload
    let payload: Record<string, any> = { message: 'Internal Server Error' };

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      // Map status codes to error types
      const errorCategories: Record<number, string> = {
        400: 'BadRequest',
        403: 'Forbidden',
        422: 'ValidationErrors',
        502: 'GatewayError',
      };
      errorType = errorCategories[status] || 'GeneralError';

      // Get the response body passed when throwing the exception
      const responseBody = exception.getResponse();
      payload = typeof responseBody === 'object' ? { ...responseBody } : { message: responseBody };
    } else {
      // Non-HttpException: log full error
      this.logger.error('Non-HTTP exception caught:', exception);
      payload = { message: exception?.message || payload.message };
      errorType = 'NonHttpError';
    }

    // Craft final response including all custom fields
    const errorResponse = {
      success: false,
      statusCode: status,
      data: {
        data: payload,
      },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}

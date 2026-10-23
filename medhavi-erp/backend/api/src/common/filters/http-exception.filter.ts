import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorDetails =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as Record<string, any>);

    const errorBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorDetails.message || exception.message || 'Internal server error',
      error: errorDetails.error || HttpStatus[status] || 'Error',
    };

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} ${status} - Error: ${JSON.stringify(errorBody)}`,
        exception.stack,
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} ${status} - ${errorBody.message}`);
    }

    response.status(status).json(errorBody);
  }
}

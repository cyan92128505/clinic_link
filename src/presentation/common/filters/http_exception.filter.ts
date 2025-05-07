import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  DomainException,
  EntityNotFoundException,
  BusinessRuleViolationException,
} from '../../../domain/common/exceptions/domain.exception';

/**
 * Interface for standardized error response
 */
interface ErrorResponse {
  message: string | string[];
  error?: string;
  [key: string]: unknown;
}

/**
 * Global HTTP exception filter to handle all exceptions
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorDetails = '';

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else {
        // Type assertion to ensure TypeScript understands the structure
        const typedErrorResponse = errorResponse as ErrorResponse;
        message = typedErrorResponse.message || exception.message;
        errorDetails = typedErrorResponse.error || '';
      }
    } else if (exception instanceof EntityNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof BusinessRuleViolationException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
      errorDetails = exception?.stack ?? '';
    }

    // Format message for logging (convert array to string if needed)
    const logMessage = Array.isArray(message) ? message.join(', ') : message;

    // Log the exception
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${logMessage}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Return a standardized error response
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(errorDetails && process.env.NODE_ENV === 'development'
        ? { error: errorDetails }
        : {}),
    });
  }
}

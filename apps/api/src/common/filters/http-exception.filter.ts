import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

function toUpperSnakeCase(message: string): string {
  return message
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        if (typeof resObj['message'] === 'string') {
          message = resObj['message'];
        } else if (Array.isArray(resObj['message'])) {
          message = (resObj['message'] as string[]).join('; ');
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log 5xx errors with stack
    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${statusCode}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    void response.status(statusCode).send({
      success: false,
      error: {
        code: toUpperSnakeCase(message),
        message,
        statusCode,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

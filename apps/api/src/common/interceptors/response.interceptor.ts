import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationMeta } from '@expertly/types';

interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function deepCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(deepCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[toCamelCase(key)] = deepCamelCase(value);
    }
    return result;
  }
  return obj;
}

function isPaginated(data: unknown): data is PaginatedData<unknown> {
  return (
    data !== null &&
    typeof data === 'object' &&
    'data' in (data as object) &&
    'meta' in (data as object) &&
    Array.isArray((data as PaginatedData<unknown>).data)
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    const response = context.switchToHttp().getResponse<FastifyReply>();
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    // Skip SSE routes
    const contentType = response.getHeader('content-type') as string | undefined;
    if (contentType?.includes('text/event-stream')) {
      return next.handle();
    }

    // Skip revalidate endpoint (Next.js webhook)
    if (request.url?.includes('/api/revalidate')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (isPaginated(data)) {
          return {
            success: true,
            data: deepCamelCase(data.data) as unknown[],
            meta: data.meta,
          };
        }
        return {
          success: true,
          data: deepCamelCase(data),
        };
      }),
    );
  }
}

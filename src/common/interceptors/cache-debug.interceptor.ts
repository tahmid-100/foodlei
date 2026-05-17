// src/common/interceptors/cache-debug.interceptor.ts
import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class CacheDebugInterceptor implements NestInterceptor {
  private readonly logger = new Logger('CacheDebug');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(`${req.method} ${req.url} — ${duration}ms`);
      }),
    );
  }
}
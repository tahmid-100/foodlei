// src/common/interceptors/logging.interceptor.ts
import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const res = context.switchToHttp().getResponse();

        this.logger.log(
          `${method} ${url} ${res.statusCode} — ${duration}ms — ${ip}`
        );

        // Slow request warning (500ms+)
        if (duration > 500) {
          this.logger.warn(`⚠️  SLOW REQUEST: ${method} ${url} took ${duration}ms`);
        }
      }),
      catchError((error) => {
        const duration = Date.now() - start;
        this.logger.error(
          `${method} ${url} ERROR — ${duration}ms — ${error.message}`
        );
        return throwError(() => error);
      }),
    );
  }
}
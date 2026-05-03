// common/pipes/sanitize.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      // Basic XSS prevention — HTML tags remove করো
      return value.replace(/<[^>]*>/g, '').trim();
    }
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }
    return value;
  }

  private sanitizeObject(obj: any): any {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string') {
        sanitized[key] = val.replace(/<[^>]*>/g, '').trim();
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }
}
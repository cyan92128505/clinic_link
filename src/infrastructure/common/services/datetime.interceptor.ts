import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateTimeService } from './datetime.service';

@Injectable()
export class DateTimeInterceptor implements NestInterceptor {
  constructor(private dateTimeService: DateTimeService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.transformResponse(data);
      }),
    );
  }

  private transformResponse(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.transformResponse(item));
    }

    if (data instanceof Date) {
      return this.dateTimeService.formatTaiwanTime(data);
    }

    if (typeof data === 'object') {
      const transformed = { ...data };

      for (const key in transformed) {
        if (transformed.hasOwnProperty(key)) {
          // 處理日期時間欄位
          if (transformed[key] instanceof Date) {
            // 保留原始 Date 對象
            transformed[key] = transformed[key];
            // 添加格式化後的版本
            transformed[`${key}Formatted`] =
              this.dateTimeService.formatTaiwanTime(transformed[key]);
          } else if (typeof transformed[key] === 'object') {
            transformed[key] = this.transformResponse(transformed[key]);
          }
        }
      }

      return transformed;
    }

    return data;
  }
}

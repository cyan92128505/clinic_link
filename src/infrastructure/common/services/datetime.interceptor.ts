import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateTimeService } from './datetime.service';

// 定義回應物件的介面
interface ResponseObject {
  [key: string]: any;
}

@Injectable()
export class DateTimeInterceptor implements NestInterceptor {
  constructor(private dateTimeService: DateTimeService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        return this.transformResponse(data);
      }),
    );
  }

  private transformResponse(data: unknown): unknown {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.transformResponse(item));
    }

    if (data instanceof Date) {
      return this.dateTimeService.formatTaiwanTime(data);
    }

    if (typeof data === 'object' && data !== null) {
      // 轉換為明確的型別
      const inputObject = data as ResponseObject;
      const transformed: ResponseObject = { ...inputObject };

      for (const key in transformed) {
        if (Object.prototype.hasOwnProperty.call(transformed, key)) {
          // 處理日期時間欄位
          if (transformed[key] instanceof Date) {
            // 格式化日期並添加新屬性
            transformed[`${key}Formatted`] =
              this.dateTimeService.formatTaiwanTime(transformed[key]);
          } else if (
            transformed[key] !== null &&
            typeof transformed[key] === 'object'
          ) {
            transformed[key] = this.transformResponse(transformed[key]);
          }
        }
      }

      return transformed;
    }

    return data;
  }
}

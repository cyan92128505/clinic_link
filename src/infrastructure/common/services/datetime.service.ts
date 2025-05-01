import { Injectable } from '@nestjs/common';
import {
  parse,
  parseISO,
  format,
  startOfDay,
  endOfDay,
  isValid,
  addDays,
  subDays,
  addMonths,
  subMonths,
} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

@Injectable()
export class DateTimeService {
  private readonly timezone = 'Asia/Taipei';

  /**
   * Get current time in Taiwan timezone
   */
  now(): Date {
    return toZonedTime(new Date(), this.timezone);
  }

  /**
   * Parse date string with format
   */
  parseDate(dateStr: string, formatStr: string = 'yyyy-MM-dd'): Date | null {
    try {
      const parsed = parse(dateStr, formatStr, new Date());
      return isValid(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Parse ISO string to Date
   */
  parseISODate(dateStr: string): Date | null {
    try {
      const parsed = parseISO(dateStr);
      return isValid(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Convert date to Taiwan timezone
   */
  toTaiwanTime(date: Date): Date {
    return toZonedTime(date, this.timezone);
  }

  /**
   * Format date in Taiwan timezone
   */
  formatTaiwanTime(
    date: Date,
    formatStr: string = 'yyyy-MM-dd HH:mm:ss',
  ): string {
    if (!date || !isValid(date)) return '';
    return formatInTimeZone(date, this.timezone, formatStr);
  }

  /**
   * Get start of day in Taiwan timezone
   */
  startOfTaiwanDay(date: Date): Date {
    const zonedDate = toZonedTime(date, this.timezone);
    const startDayLocal = startOfDay(zonedDate);
    return toZonedTime(startDayLocal, this.timezone);
  }

  /**
   * Get end of day in Taiwan timezone
   */
  endOfTaiwanDay(date: Date): Date {
    const zonedDate = toZonedTime(date, this.timezone);
    const endDayLocal = endOfDay(zonedDate);
    return toZonedTime(endDayLocal, this.timezone);
  }

  /**
   * Helper methods for common date operations
   */
  addDays(date: Date, amount: number): Date {
    return addDays(date, amount);
  }

  subtractDays(date: Date, amount: number): Date {
    return subDays(date, amount);
  }

  addMonths(date: Date, amount: number): Date {
    return addMonths(date, amount);
  }

  subtractMonths(date: Date, amount: number): Date {
    return subMonths(date, amount);
  }

  /**
   * Check if date string is valid
   */
  isValidDateString(
    dateStr: string,
    formatStr: string = 'yyyy-MM-dd',
  ): boolean {
    return this.parseDate(dateStr, formatStr) !== null;
  }

  /**
   * Create date range for queries
   */
  createDateRange(dateStr: string): { startDate: Date; endDate: Date } | null {
    const date = this.parseDate(dateStr);
    if (!date) return null;

    return {
      startDate: this.startOfTaiwanDay(date),
      endDate: this.endOfTaiwanDay(date),
    };
  }
}

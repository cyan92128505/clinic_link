import { Logger } from '@nestjs/common';

/**
 * Base controller that all controllers should extend
 */
export abstract class BaseController {
  protected readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  /**
   * Create a standard success response
   */
  protected success<T>(data: T, message: string = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }

  /**
   * Create a paginated response
   */
  protected paginate<T>(data: T[], total: number, page: number, limit: number) {
    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

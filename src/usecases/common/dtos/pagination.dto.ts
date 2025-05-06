/**
 * Standard input parameters for pagination queries
 */
export class PaginationQueryParams {
  /**
   * Current page number (1-based)
   */
  page: number = 1;

  /**
   * Number of items per page
   */
  limit: number = 50;
}

/**
 * Standard metadata for paginated responses
 */
export class PaginationMeta {
  /**
   * Total number of items
   */
  total: number;

  /**
   * Current page number
   */
  page: number;

  /**
   * Number of items per page
   */
  limit: number;

  /**
   * Total number of pages
   */
  totalPages: number;
}

/**
 * Standard response format for paginated data
 */
export class PaginatedResponse<T> {
  /**
   * Array of items for the current page
   */
  data: T[];

  /**
   * Pagination metadata
   */
  meta: PaginationMeta;

  constructor(data: T[], meta: PaginationMeta) {
    this.data = data;
    this.meta = meta;
  }
}

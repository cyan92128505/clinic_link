import { PaginationQueryParams } from '../../../common/dtos/pagination.dto';

export class GetActivityLogsQuery {
  constructor(
    public readonly clinicId: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly userId?: string,
    public readonly action?: string,
    public readonly resource?: string,
    public readonly pagination: PaginationQueryParams = {
      page: 1,
      limit: 50,
    },
  ) {}
}

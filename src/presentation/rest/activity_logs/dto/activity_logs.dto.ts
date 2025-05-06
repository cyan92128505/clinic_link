import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityLogDto } from '../../../../usecases/activity_logs/queries/get_activity_logs/get_activity_logs.response';
import { PaginationMeta } from '../../../../usecases/common/dtos/pagination.dto';

/**
 * DTO for activity log information response
 */
export class ActivityLogResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the activity log',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the user who performed the action',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    description: 'Name of the user who performed the action',
    example: '王小明',
  })
  userName: string;

  @ApiProperty({
    description: 'Email of the user who performed the action',
    example: 'user@example.com',
  })
  userEmail: string;

  @ApiProperty({
    description: 'Type of action performed',
    example: 'CREATE',
  })
  action: string;

  @ApiProperty({
    description: 'Resource type that was affected',
    example: 'APPOINTMENT',
  })
  resource: string;

  @ApiPropertyOptional({
    description: 'ID of the specific resource that was affected',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  resourceId?: string;

  @ApiPropertyOptional({
    description: 'Additional details about the activity',
    example: { status: 'COMPLETED', previousStatus: 'IN_PROGRESS' },
  })
  details?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'IP address from which the action was performed',
    example: '192.168.0.1',
  })
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent information',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent?: string;

  @ApiProperty({
    description: 'Timestamp when the activity occurred',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt?: Date;

  constructor(activityLogDto: ActivityLogDto) {
    this.id = activityLogDto.id;
    this.userId = activityLogDto.userId;
    this.userName = activityLogDto.userName;
    this.userEmail = activityLogDto.userEmail;
    this.action = activityLogDto.action;
    this.resource = activityLogDto.resource;
    this.resourceId = activityLogDto.resourceId;
    this.details = activityLogDto.details;
    this.ipAddress = activityLogDto.ipAddress;
    this.userAgent = activityLogDto.userAgent;
    this.createdAt = activityLogDto.createdAt;
  }
}

/**
 * DTO for pagination metadata
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: 'Total number of records',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of records per page',
    example: 50,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 2,
  })
  totalPages: number;

  constructor(meta: PaginationMeta) {
    this.total = meta.total;
    this.page = meta.page;
    this.limit = meta.limit;
    this.totalPages = meta.totalPages;
  }
}

/**
 * Response structure for activity logs list with pagination
 */
export class ActivityLogsResponseDto {
  @ApiProperty({
    description: 'List of activity logs',
    type: [ActivityLogResponseDto],
  })
  data: ActivityLogResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;

  constructor(activityLogs: ActivityLogDto[], meta: PaginationMeta) {
    this.data = activityLogs.map((log) => new ActivityLogResponseDto(log));
    this.meta = new PaginationMetaDto(meta);
  }
}

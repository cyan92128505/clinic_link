import { Controller, Get, Logger, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt_auth.guard';
import { GetDepartmentsHandler } from '../../../usecases/departments/queries/get_departments/get_departments.handler';
import { GetDepartmentsQuery } from '../../../usecases/departments/queries/get_departments/get_departments.query';
import { DepartmentsResponseDto } from './dto/departments.dto';

/**
 * Interface for authenticated user request
 */
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    selectedClinicId: string;
  };
}

/**
 * Controller for department-related endpoints
 */
@ApiTags('departments')
@Controller('api/v1/departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DepartmentsController {
  private readonly logger = new Logger(DepartmentsController.name);

  constructor(private readonly getDepartmentsHandler: GetDepartmentsHandler) {}

  /**
   * Get all departments for the current clinic
   */
  @Get()
  @ApiOperation({ summary: 'Get all departments in current clinic' })
  @ApiResponse({
    status: 200,
    description: 'List of departments retrieved successfully',
    type: DepartmentsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Clinic not found' })
  async getDepartments(
    @Request() req: AuthenticatedRequest,
  ): Promise<DepartmentsResponseDto> {
    this.logger.debug('Getting departments for current clinic');

    // Extract clinic ID from the authenticated user's context
    const clinicId: string = req.user.selectedClinicId;

    if (!clinicId) {
      this.logger.warn('No clinic selected for user');
      throw new Error('No clinic selected. Please select a clinic first.');
    }

    // Create query and execute handler
    const query = new GetDepartmentsQuery(clinicId);
    const response = await this.getDepartmentsHandler.execute(query);

    // Map to response DTO
    return new DepartmentsResponseDto(response.departments);
  }
}

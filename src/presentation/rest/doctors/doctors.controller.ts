import {
  Controller,
  Get,
  Logger,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt_auth.guard';
import { GetDoctorsHandler } from '../../../usecases/doctors/queries/get_doctors/get_doctors.handler';
import { GetDoctorsQuery } from '../../../usecases/doctors/queries/get_doctors/get_doctors.query';
import { DoctorsResponseDto } from './dto/doctors.dto';

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
 * Controller for doctor-related endpoints
 */
@ApiTags('doctors')
@Controller('doctors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DoctorsController {
  private readonly logger = new Logger(DoctorsController.name);

  constructor(private readonly getDoctorsHandler: GetDoctorsHandler) {}

  /**
   * Get all doctors for the current clinic with optional filtering
   */
  @Get()
  @ApiOperation({
    summary: 'Get all doctors in current clinic with optional filtering',
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    description: 'Filter doctors by department ID',
    type: String,
  })
  @ApiQuery({
    name: 'roomId',
    required: false,
    description: 'Filter doctors by room assignment',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of doctors retrieved successfully',
    type: DoctorsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Clinic or department not found' })
  async getDoctors(
    @Request() req: AuthenticatedRequest,
    @Query('departmentId') departmentId?: string,
    @Query('roomId') roomId?: string,
  ): Promise<DoctorsResponseDto> {
    this.logger.debug(
      `Getting doctors for current clinic. Filters: departmentId=${departmentId}, roomId=${roomId}`,
    );

    // Extract clinic ID from the authenticated user's context
    const clinicId: string = req.user.selectedClinicId;

    if (!clinicId) {
      this.logger.warn('No clinic selected for user');
      throw new Error('No clinic selected. Please select a clinic first.');
    }

    // Create query with filters and execute handler
    const query = new GetDoctorsQuery(clinicId, departmentId, roomId);
    const response = await this.getDoctorsHandler.execute(query);

    // Map to response DTO
    return new DoctorsResponseDto(response.doctors);
  }
}

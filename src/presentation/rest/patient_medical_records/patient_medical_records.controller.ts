import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  GetPatientMedicalRecordsQueryDto,
  GetPatientMedicalRecordsResponseDto,
} from './dto/patient_medical_records.dto';
import { PatientFirebaseAuthGuard } from 'src/infrastructure/auth/guards/patient_firebase_auth.guard';
import { GetPatientMedicalRecordsQuery } from 'src/usecases/patient_clinics/queries/get_patient_medical_records/get_patient_medical_records.query';
import { GetPatientMedicalRecordsHandler } from 'src/usecases/patient_clinics/queries/get_patient_medical_records/get_patient_medical_records.handler';
import { PatientClinicRelationNotFoundException } from 'src/domain/patient/exceptions/patient.exceptions';

@ApiTags('Patient Medical Records')
@Controller('patient/clinics')
@UseGuards(PatientFirebaseAuthGuard)
@ApiBearerAuth()
export class PatientMedicalRecordsController {
  constructor(
    private readonly getPatientMedicalRecordsHandler: GetPatientMedicalRecordsHandler,
  ) {}

  @Get(':clinicId/medical-records')
  @ApiOperation({
    summary: 'Get patient medical records for a specific clinic',
    description:
      'Retrieves the medical records of a patient in a specific clinic with optional date filtering and pagination.',
  })
  @ApiParam({
    name: 'clinicId',
    description: 'The ID of the clinic',
    type: String,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Optional start date for filtering records',
    required: false,
    type: Date,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Optional end date for filtering records',
    required: false,
    type: Date,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of records per page',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Patient medical records retrieved successfully',
    type: GetPatientMedicalRecordsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Patient authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not linked to this clinic or clinic not found',
  })
  async getPatientMedicalRecords(
    @Req() req: any,
    @Param('clinicId') clinicId: string,
    @Query() queryDto: GetPatientMedicalRecordsQueryDto,
  ): Promise<GetPatientMedicalRecordsResponseDto> {
    try {
      // Create query object from request parameters
      const query = new GetPatientMedicalRecordsQuery(
        req.patient.id, // Patient ID from the JWT token
        clinicId,
        queryDto.startDate,
        queryDto.endDate,
        queryDto.page,
        queryDto.limit,
      );

      // Execute the query handler
      return await this.getPatientMedicalRecordsHandler.execute(query);
    } catch (error) {
      // Handle specific exceptions
      if (error instanceof PatientClinicRelationNotFoundException) {
        throw new NotFoundException(
          `Patient is not linked to clinic with ID: ${clinicId}`,
        );
      }

      // Re-throw other exceptions
      throw error;
    }
  }
}

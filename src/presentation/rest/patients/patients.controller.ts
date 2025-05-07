import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
  ConflictException,
  HttpCode,
  HttpStatus,
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
  GetClinicPatientsQueryDto,
  CreateClinicPatientDto,
  UpdateClinicPatientDto,
  GetClinicPatientsResponseDto,
  CreateClinicPatientResponseDto,
  GetClinicPatientByIdResponseDto,
  UpdateClinicPatientResponseDto,
  PatientDto,
  PatientClinicInfoDto,
} from './dto/patients.dto';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt_auth.guard';
import { ClinicContext } from 'src/infrastructure/auth/decorators/clinic_context.decorator';
import { CurrentUser } from 'src/infrastructure/auth/decorators/current_user.decorator';
import { User } from 'src/domain/user/entities/user.entity';
import { GetClinicPatientsQuery } from 'src/usecases/patients/queries/get_clinic_patients/get_clinic_patients.query';
import { GetClinicPatientsHandler } from 'src/usecases/patients/queries/get_clinic_patients/get_clinic_patients.handler';
import { GetClinicPatientByIdQuery } from 'src/usecases/patients/queries/get_clinic_patient_by_id/get_clinic_patient_by_id.query';
import { GetClinicPatientByIdHandler } from 'src/usecases/patients/queries/get_clinic_patient_by_id/get_clinic_patient_by_id.handler';
import { CreateClinicPatientCommand } from 'src/usecases/patients/commands/create_clinic_patient/create_clinic_patient.command';
import { CreateClinicPatientHandler } from 'src/usecases/patients/commands/create_clinic_patient/create_clinic_patient.handler';
import { UpdateClinicPatientCommand } from 'src/usecases/patients/commands/update_clinic_patient/update_clinic_patient.command';
import { UpdateClinicPatientHandler } from 'src/usecases/patients/commands/update_clinic_patient/update_clinic_patient.handler';
import { Patient } from 'src/domain/patient/entities/patient.entity';
import { PatientClinic } from 'src/domain/patient/entities/patient_clinic.entity';
import { CreateClinicPatientResponse } from 'src/usecases/patients/commands/create_clinic_patient/create_clinic_patient.response';

@ApiTags('Patients')
@Controller('patients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PatientsController {
  constructor(
    private readonly getClinicPatientsHandler: GetClinicPatientsHandler,
    private readonly getClinicPatientByIdHandler: GetClinicPatientByIdHandler,
    private readonly createClinicPatientHandler: CreateClinicPatientHandler,
    private readonly updateClinicPatientHandler: UpdateClinicPatientHandler,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get patients in current clinic',
    description:
      'Retrieves a paginated list of patients in the current clinic with search functionality.',
  })
  @ApiQuery({
    name: 'search',
    description: 'Search by name, phone, or patient number',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of patients',
    type: GetClinicPatientsResponseDto,
  })
  async getPatients(
    @ClinicContext() clinicId: string,
    @Query() queryDto: GetClinicPatientsQueryDto,
  ): Promise<GetClinicPatientsResponseDto> {
    // Create a query object from request parameters
    const query = new GetClinicPatientsQuery(
      clinicId,
      {
        page: queryDto.page,
        limit: queryDto.limit,
      },
      {
        search: queryDto.search,
      },
    );

    // Execute the query handler
    const result = await this.getClinicPatientsHandler.execute(query);

    // Transform the result to match the expected response format
    const response: GetClinicPatientsResponseDto = {
      data: result.patients
        .map((item) => item)
        .filter((item) => item.patient != null)
        .map((item) => this.mapToPatientDto(item.patient!, item.patientClinic)),
      meta: {
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      },
    };

    return response;
  }

  @Post()
  @ApiOperation({
    summary: 'Create new patient',
    description: 'Creates a new patient in the current clinic.',
  })
  @ApiResponse({
    status: 201,
    description: 'Patient created successfully',
    type: CreateClinicPatientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Patient with same national ID already exists',
  })
  @HttpCode(HttpStatus.CREATED)
  async createPatient(
    @ClinicContext() clinicId: string,
    @CurrentUser() currentUser: User,
    @Body() createPatientDto: CreateClinicPatientDto,
  ): Promise<CreateClinicPatientResponseDto> {
    try {
      // Create command object from request body
      const command = new CreateClinicPatientCommand(
        clinicId,
        createPatientDto.name,
        createPatientDto.phone,
        createPatientDto.nationalId,
        createPatientDto.birthDate,
        createPatientDto.gender,
        createPatientDto.email,
        createPatientDto.address,
        createPatientDto.emergencyContact,
        createPatientDto.emergencyPhone,
        undefined, // patientNumber - 可以自動生成或從DTO取得
        {}, // medicalHistory - 初始為空物件
        createPatientDto.note,
      );

      // Execute the command handler
      const result = await this.createClinicPatientHandler.execute(command);

      // Transform the result to match the expected response format
      return this.mapFromCreatePatientResponse(result);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message?.includes('UNIQUE constraint failed')
      ) {
        throw new ConflictException(
          'Patient with this national ID already exists',
        );
      }
      throw error;
    }
  }

  @Get(':patientId')
  @ApiOperation({
    summary: 'Get patient details',
    description:
      'Retrieves details of a specific patient in the current clinic.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'The ID of the patient',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns patient details',
    type: GetClinicPatientByIdResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  async getPatientById(
    @ClinicContext() clinicId: string,
    @Param('patientId') patientId: string,
  ): Promise<GetClinicPatientByIdResponseDto> {
    try {
      // Create query object from request parameters
      const query = new GetClinicPatientByIdQuery(clinicId, patientId);

      // Execute the query handler
      const result = await this.getClinicPatientByIdHandler.execute(query);

      // Transform the result to match the expected response format
      return this.mapToPatientDto(result.patient, result.patientClinic);
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('not found')) {
        throw new NotFoundException(
          `Patient with ID ${patientId} not found in this clinic`,
        );
      }
      throw error;
    }
  }

  @Put(':patientId')
  @ApiOperation({
    summary: 'Update patient information',
    description:
      'Updates information of a specific patient in the current clinic.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'The ID of the patient',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Patient updated successfully',
    type: UpdateClinicPatientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Patient with same national ID already exists',
  })
  async updatePatient(
    @ClinicContext() clinicId: string,
    @Param('patientId') patientId: string,
    @CurrentUser() currentUser: User,
    @Body() updatePatientDto: UpdateClinicPatientDto,
  ): Promise<UpdateClinicPatientResponseDto> {
    try {
      // Create command object from request parameters and body
      const command = new UpdateClinicPatientCommand(
        clinicId,
        patientId,
        updatePatientDto,
        currentUser.id,
      );

      // Execute the command handler
      await this.updateClinicPatientHandler.execute(command);

      // After update, fetch the updated patient data
      const query = new GetClinicPatientByIdQuery(clinicId, patientId);
      const updatedPatientResult =
        await this.getClinicPatientByIdHandler.execute(query);

      // Transform the result to match the expected response format
      return this.mapToPatientDto(
        updatedPatientResult.patient,
        updatedPatientResult.patientClinic,
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('not found')) {
        throw new NotFoundException(
          `Patient with ID ${patientId} not found in this clinic`,
        );
      }
      if (
        error instanceof Error &&
        error.message?.includes('UNIQUE constraint failed')
      ) {
        throw new ConflictException(
          'Patient with this national ID already exists',
        );
      }
      throw error;
    }
  }

  // Helper method to map domain entities to DTO
  private mapToPatientDto(
    patient: Patient,
    patientClinic: PatientClinic,
  ): PatientDto {
    const clinicInfo: PatientClinicInfoDto = {
      patientNumber: patientClinic.patientNumber,
      firstVisitDate: patientClinic.firstVisitDate,
      lastVisitDate: patientClinic.lastVisitDate,
      isActive: patientClinic.isActive,
      medicalHistory: patientClinic.medicalHistory,
      note: patientClinic.note,
    };

    return {
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      nationalId: patient.nationalId,
      birthDate: patient.birthDate,
      gender: patient.gender,
      email: patient.email,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      clinicInfo: clinicInfo,
    };
  }

  // 新增一個輔助方法將CreateClinicPatientResponse轉換為PatientDto
  private mapFromCreatePatientResponse(
    response: CreateClinicPatientResponse,
  ): PatientDto {
    // 從回應中建立clinicInfo物件
    const clinicInfo: PatientClinicInfoDto = {
      patientNumber: response.patientNumber,
      // 因為回應中沒有firstVisitDate和lastVisitDate欄位，使用createdAt作為預設值
      firstVisitDate: response.createdAt || new Date(),
      lastVisitDate: response.createdAt || new Date(),
      isActive: response.isActive,
      // 其他欄位依需要設定
      medicalHistory: {},
      note: '',
    };

    // 建立並回傳PatientDto
    return {
      id: response.patientId,
      name: response.name,
      phone: response.phone,
      nationalId: response.nationalId,
      birthDate: response.birthDate,
      gender: response.gender,
      email: response.email,
      address: response.address,
      emergencyContact: response.emergencyContact,
      emergencyPhone: response.emergencyPhone,
      createdAt: response.createdAt || new Date(),
      updatedAt: response.createdAt || new Date(), // 初次創建時更新時間等於創建時間
      clinicInfo: clinicInfo,
    };
  }
}

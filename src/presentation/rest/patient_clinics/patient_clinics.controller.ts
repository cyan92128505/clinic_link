import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import {
  LinkToClinicDto,
  PatientClinicInfoDto,
  PatientClinicResponseDto,
} from './dto/patient_clinics.dto';
import { PatientFirebaseAuthGuard } from '../../../infrastructure/auth/guards/patient_firebase_auth.guard';
import { LinkPatientToClinicHandler } from '../../../usecases/patient_clinics/commands/link_patient_to_clinic/link_patient_to_clinic.handler';
import { LinkPatientToClinicCommand } from '../../../usecases/patient_clinics/commands/link_patient_to_clinic/link_patient_to_clinic.command';
import { GetPatientClinicsHandler } from '../../../usecases/patient_clinics/queries/get_patient_clinics/get_patient_clinics.handler';
import { GetPatientClinicsQuery } from '../../../usecases/patient_clinics/queries/get_patient_clinics/get_patient_clinics.query';
import { GetPatientClinicInfoHandler } from '../../../usecases/patient_clinics/queries/get_patient_clinic_info/get_patient_clinic_info.handler';
import { GetPatientClinicInfoQuery } from '../../../usecases/patient_clinics/queries/get_patient_clinic_info/get_patient_clinic_info.query';

@ApiTags('patient-clinics')
@Controller('patient/clinics')
@UseGuards(PatientFirebaseAuthGuard)
@ApiBearerAuth('patient-token')
export class PatientClinicsController {
  constructor(
    private readonly linkPatientToClinicHandler: LinkPatientToClinicHandler,
    private readonly getPatientClinicsHandler: GetPatientClinicsHandler,
    private readonly getPatientClinicInfoHandler: GetPatientClinicInfoHandler,
  ) {}

  /**
   * Get all clinics linked to the authenticated patient
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get patient's linked clinics" })
  @ApiResponse({
    status: 200,
    description: 'Returns list of linked clinics',
    type: [PatientClinicInfoDto],
  })
  async getPatientClinics(@Req() req) {
    // The patient is attached to request by the PatientFirebaseAuthGuard
    const query = new GetPatientClinicsQuery(req.patient.id);
    return await this.getPatientClinicsHandler.execute(query);
  }

  /**
   * Link the authenticated patient to a clinic
   */
  @Post(':clinicId/link')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Link patient to clinic' })
  @ApiParam({
    name: 'clinicId',
    description: 'Clinic ID to link the patient to',
    type: String,
  })
  @ApiBody({ type: LinkToClinicDto })
  @ApiResponse({
    status: 201,
    description: 'Link created successfully',
    type: PatientClinicResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Clinic not found',
  })
  async linkToClinic(
    @Req() req,
    @Param('clinicId') clinicId: string,
    @Body() dto: LinkToClinicDto,
  ) {
    // Create command with patient ID from the auth guard
    const command = new LinkPatientToClinicCommand(
      req.patient.id,
      clinicId,
      dto.patientNumber,
    );

    try {
      return await this.linkPatientToClinicHandler.execute(command);
    } catch (error) {
      if (error.message.includes('Clinic not found')) {
        throw new NotFoundException('Clinic not found');
      }
      throw error;
    }
  }

  /**
   * Get patient's information in a specific clinic
   */
  @Get(':clinicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get patient's information in specific clinic" })
  @ApiParam({
    name: 'clinicId',
    description: 'Clinic ID to get patient information from',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns patient info in clinic',
    type: PatientClinicInfoDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not linked to clinic',
  })
  async getClinicInfo(@Req() req, @Param('clinicId') clinicId: string) {
    const query = new GetPatientClinicInfoQuery(req.patient.id, clinicId);

    try {
      return await this.getPatientClinicInfoHandler.execute(query);
    } catch (error) {
      if (error.message.includes('Patient not linked to clinic')) {
        throw new NotFoundException('Patient not linked to clinic');
      }
      throw error;
    }
  }
}

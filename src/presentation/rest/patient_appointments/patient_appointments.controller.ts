import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  Req,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { PatientFirebaseAuthGuard } from 'src/infrastructure/auth/guards/patient_firebase_auth.guard';
import {
  CreatePatientAppointmentDto,
  UpdatePatientAppointmentDto,
  PatientAppointmentResponseDto,
  PatientAppointmentListResponseDto,
} from './dto/patient_appointments.dto';

// 引入用例處理類
import { CreatePatientAppointmentHandler } from 'src/usecases/patient_appointment/commands/create_patient_appointment/create_patient_appointment.handler';
import { CreatePatientAppointmentCommand } from 'src/usecases/patient_appointment/commands/create_patient_appointment/create_patient_appointment.command';
import { UpdatePatientAppointmentHandler } from 'src/usecases/patient_appointment/commands/update_patient_appointment/update_patient_appointment.handler';
import { UpdatePatientAppointmentCommand } from 'src/usecases/patient_appointment/commands/update_patient_appointment/update_patient_appointment.command';
import { CancelPatientAppointmentHandler } from 'src/usecases/patient_appointment/commands/cancel_patient_appointment/cancel_patient_appointment.handler';
import { CancelPatientAppointmentCommand } from 'src/usecases/patient_appointment/commands/cancel_patient_appointment/cancel_patient_appointment.command';
import { GetPatientAppointmentsHandler } from 'src/usecases/patient_appointment/queries/get_patient_appointments/get_patient_appointments.handler';
import { GetPatientAppointmentsQuery } from 'src/usecases/patient_appointment/queries/get_patient_appointments/get_patient_appointments.query';
import { GetPatientAppointmentByIdHandler } from 'src/usecases/patient_appointment/queries/get_patient_appointment_by_id/get_patient_appointment_by_id.handler';
import { GetPatientAppointmentByIdQuery } from 'src/usecases/patient_appointment/queries/get_patient_appointment_by_id/get_patient_appointment_by_id.query';
import { LinkPatientToClinicCommand } from 'src/usecases/patient_clinics/commands/link_patient_to_clinic/link_patient_to_clinic.command';
import { AppointmentSource } from 'src/domain/appointment/value_objects/appointment.enum';

@ApiTags('patient-appointments')
@Controller('patient/appointments')
@UseGuards(PatientFirebaseAuthGuard)
@ApiBearerAuth('patient-token')
export class PatientAppointmentsController {
  constructor(
    private readonly createPatientAppointmentHandler: CreatePatientAppointmentHandler,
    private readonly updatePatientAppointmentHandler: UpdatePatientAppointmentHandler,
    private readonly cancelPatientAppointmentHandler: CancelPatientAppointmentHandler,
    private readonly getPatientAppointmentsHandler: GetPatientAppointmentsHandler,
    private readonly getPatientAppointmentByIdHandler: GetPatientAppointmentByIdHandler,
    private readonly commandBus: CommandBus,
  ) {}

  /**
   * Get all appointments for the authenticated patient
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get patient's appointments" })
  @ApiQuery({
    name: 'clinicId',
    required: false,
    description: 'Filter appointments by clinic',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of appointments',
    type: PatientAppointmentListResponseDto,
  })
  async getPatientAppointments(
    @Req() req,
    @Query('clinicId') clinicId?: string,
  ) {
    // Create query with patient ID (from auth guard) and optional clinic filter
    const query = new GetPatientAppointmentsQuery(req.patient.id, clinicId);

    return await this.getPatientAppointmentsHandler.execute(query);
  }

  /**
   * Create a new appointment for the authenticated patient
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create appointment (from patient app)' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created',
    type: PatientAppointmentResponseDto,
  })
  async createPatientAppointment(
    @Req() req,
    @Body() dto: CreatePatientAppointmentDto,
  ) {
    // Ensure patient is linked to the clinic first
    try {
      // Directly use command bus to link patient to clinic
      const linkCommand = new LinkPatientToClinicCommand(
        req.patient.id,
        dto.clinicId,
      );

      await this.commandBus.execute(linkCommand);
    } catch (error) {
      if (error.message.includes('Clinic not found')) {
        throw new NotFoundException('Clinic not found');
      }
      // For other errors related to linking, we can still proceed with appointment creation
      // as the link might already exist
    }

    // Create command with patient ID (from auth guard) and provided data
    const command = new CreatePatientAppointmentCommand(
      dto.clinicId,
      req.patient.id,
      dto.doctorId,
      dto.departmentId,
      new Date(dto.appointmentTime),
      dto.note,
      AppointmentSource.ONLINE,
    );

    return await this.createPatientAppointmentHandler.execute(command);
  }

  /**
   * Get details of a specific appointment
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get appointment details' })
  @ApiParam({
    name: 'id',
    description: 'Appointment ID',
  })
  @ApiQuery({
    name: 'clinicId',
    required: true,
    description: 'Clinic ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns appointment details',
    type: PatientAppointmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  async getAppointmentById(
    @Req() req,
    @Param('id') id: string,
    @Query('clinicId') clinicId?: string,
  ) {
    // Get current appointment to determine the clinic ID if not provided
    if (!clinicId) {
      // You might need to fetch appointment first to get clinic ID
      // For simplicity, we'll throw an error requesting the clinic ID
      throw new NotFoundException(
        'Please specify clinicId as a query parameter',
      );
    }

    // Create query with appointment ID and patient ID for ownership check
    const query = new GetPatientAppointmentByIdQuery(
      id,
      clinicId,
      req.patient.id,
    );

    try {
      return await this.getPatientAppointmentByIdHandler.execute(query);
    } catch (error) {
      if (
        error.message.includes('Appointment not found') ||
        error.message.includes('not authorized')
      ) {
        throw new NotFoundException('Appointment not found');
      }
      throw error;
    }
  }

  /**
   * Update an existing appointment
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update appointment' })
  @ApiParam({
    name: 'id',
    description: 'Appointment ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated',
    type: PatientAppointmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  async updateAppointment(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdatePatientAppointmentDto,
  ) {
    // Create command with appointment ID, patient ID, and updates
    const command = new UpdatePatientAppointmentCommand(
      id,
      dto.clinicId,
      req.patient.id,
      undefined,
      dto.appointmentTime != null ? new Date(dto.appointmentTime) : undefined,
      dto.note,
    );

    try {
      return await this.updatePatientAppointmentHandler.execute(command);
    } catch (error) {
      if (
        error.message.includes('Appointment not found') ||
        error.message.includes('not authorized')
      ) {
        throw new NotFoundException('Appointment not found');
      }
      if (error.message.includes('cannot be updated')) {
        throw new ForbiddenException('Appointment cannot be updated');
      }
      throw error;
    }
  }

  /**
   * Cancel an appointment
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiParam({
    name: 'id',
    description: 'Appointment ID',
  })
  @ApiQuery({
    name: 'clinicId',
    required: true,
    description: 'Clinic ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Appointment cancelled',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  async cancelAppointment(
    @Req() req,
    @Param('id') id: string,
    @Query('clinicId') clinicId: string,
  ) {
    if (!clinicId) {
      throw new NotFoundException(
        'Please specify clinicId as a query parameter',
      );
    }
    // Create command with appointment ID and patient ID for ownership check
    const command = new CancelPatientAppointmentCommand(
      id,
      clinicId,
      req.patient.id,
    );

    try {
      await this.cancelPatientAppointmentHandler.execute(command);
    } catch (error) {
      if (
        error.message.includes('Appointment not found') ||
        error.message.includes('not authorized')
      ) {
        throw new NotFoundException('Appointment not found');
      }
      if (error.message.includes('cannot be cancelled')) {
        throw new ForbiddenException('Appointment cannot be cancelled');
      }
      throw error;
    }
  }
}

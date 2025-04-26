import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  GetAppointmentsQueryDto,
} from './dto/appointment.dto';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt_auth.guard';
import { RolesGuard } from '../../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../../infrastructure/auth/decorators/roles.decorator';
import { GetAppointmentsHandler } from '../../../usecases/appointment/queries/get_appointments/get_appointments.handler';
import { GetAppointmentsQuery } from '../../../usecases/appointment/queries/get_appointments/get_appointments.query';
import { CreateAppointmentHandler } from '../../../usecases/appointment/commands/create_appointment/create_appointment.handler';
import { CreateAppointmentCommand } from '../../../usecases/appointment/commands/create_appointment/create_appointment.command';
import { UpdateAppointmentHandler } from '../../../usecases/appointment/commands/update_appointment/update_appointment.handler';
import { UpdateAppointmentCommand } from '../../../usecases/appointment/commands/update_appointment/update_appointment.command';
import { BaseController } from '../../common/base.controller';

interface RequestWithClinic extends Request {
  user: {
    id: string;
    clinicId: string;
    role: string;
  };
}

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentController extends BaseController {
  constructor(
    private readonly getAppointmentsHandler: GetAppointmentsHandler,
    private readonly createAppointmentHandler: CreateAppointmentHandler,
    private readonly updateAppointmentHandler: UpdateAppointmentHandler,
  ) {
    super('');
  }

  @Get()
  @ApiOperation({ summary: 'Get appointments' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a list of appointments filtered by query parameters',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'SCHEDULED',
      'CHECKED_IN',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ],
    description: 'Filter by status',
  })
  async getAppointments(
    @Query() query: GetAppointmentsQueryDto,
    @Req() req: RequestWithClinic,
  ) {
    const { date, status } = query;
    const clinicId = req.user.clinicId;

    const getQuery = new GetAppointmentsQuery(clinicId, date, status);
    const result = await this.getAppointmentsHandler.execute(getQuery);

    return this.success(result.appointments, 'Get appointments successful');
  }

  @Post()
  @Roles('ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Create appointment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Creates a new appointment',
  })
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req: RequestWithClinic,
  ) {
    const clinicId = req.user.clinicId;

    const command = new CreateAppointmentCommand(
      clinicId,
      createAppointmentDto.patientId,
      createAppointmentDto.doctorId,
      createAppointmentDto.departmentId,
      createAppointmentDto.appointmentTime,
      createAppointmentDto.source,
      createAppointmentDto.note,
    );

    const result = await this.createAppointmentHandler.execute(command);

    return this.success(result, 'Appointment created successfully');
  }

  @Put(':id')
  @Roles('ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updates an existing appointment',
  })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req: RequestWithClinic,
  ) {
    const clinicId = req.user.clinicId;

    const command = new UpdateAppointmentCommand(
      id,
      clinicId,
      updateAppointmentDto.status,
      updateAppointmentDto.doctorId,
      updateAppointmentDto.roomId,
      updateAppointmentDto.appointmentTime,
      updateAppointmentDto.note,
    );

    const result = await this.updateAppointmentHandler.execute(command);

    return this.success(result, 'Appointment updated successfully');
  }
}

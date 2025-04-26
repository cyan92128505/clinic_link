import { Injectable, Inject } from '@nestjs/common';
import { IAppointmentRepository } from '../../../../domain/appointment/interfaces/appointment.repository.interface';
import { GetAppointmentsQuery } from './get_appointments.query';
import {
  GetAppointmentsResponse,
  AppointmentResponse,
} from './get_appointments.response';

@Injectable()
export class GetAppointmentsHandler {
  constructor(
    @Inject('IAppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(query: GetAppointmentsQuery): Promise<GetAppointmentsResponse> {
    const { clinicId, date, status } = query;

    const appointments = await this.appointmentRepository.findAll(
      clinicId,
      date,
      status,
    );

    // Transform domain entities to response DTOs
    // Note: In a real implementation, you would fetch related patient, doctor, and room names
    const appointmentResponses = appointments.map(
      (appointment) => new AppointmentResponse(appointment),
    );

    return new GetAppointmentsResponse(appointmentResponses);
  }
}

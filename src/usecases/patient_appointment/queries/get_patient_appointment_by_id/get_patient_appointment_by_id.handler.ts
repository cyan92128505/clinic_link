import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetPatientAppointmentByIdQuery } from './get_patient_appointment_by_id.query';
import { GetPatientAppointmentByIdResponse } from './get_patient_appointment_by_id.response';
import { IAppointmentRepository } from 'src/domain/appointment/interfaces/appointment.repository.interface';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IPatientClinicRepository } from 'src/domain/patient/interfaces/patient_clinic.repository.interface';

@Injectable()
export class GetPatientAppointmentByIdHandler {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,

    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,

    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,
  ) {}

  async execute(
    query: GetPatientAppointmentByIdQuery,
  ): Promise<GetPatientAppointmentByIdResponse> {
    // Find the appointment by id and clinic id
    const appointment = await this.appointmentRepository.findById(
      query.appointmentId,
      query.clinicId,
    );

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with id ${query.appointmentId} not found in clinic ${query.clinicId}`,
      );
    }

    // Verify that the appointment belongs to the patient
    if (appointment.patientId !== query.patientId) {
      throw new ForbiddenException(
        'You do not have permission to view this appointment',
      );
    }

    // Get patient details
    const patient = await this.patientRepository.findById(query.patientId);
    if (!patient) {
      throw new NotFoundException(
        `Patient with id ${query.patientId} not found`,
      );
    }

    // Get patient-clinic relationship
    const patientClinic =
      await this.patientClinicRepository.findByPatientAndClinic(
        query.patientId,
        query.clinicId,
      );

    // Format the response
    return {
      id: appointment.id,
      clinicId: appointment.clinicId,
      patientId: appointment.patientId,
      patientName: patient.name,
      patientNumber: patientClinic?.patientNumber,
      doctorId: appointment.doctorId,
      roomId: appointment.roomId,
      appointmentNumber: appointment.appointmentNumber,
      appointmentTime: appointment.appointmentTime,
      checkinTime: appointment.checkinTime,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      source: appointment.source,
      note: appointment.note,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
}

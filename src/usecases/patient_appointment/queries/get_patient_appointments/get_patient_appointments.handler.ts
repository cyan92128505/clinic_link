import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GetPatientAppointmentsQuery } from './get_patient_appointments.query';
import {
  GetPatientAppointmentsResponse,
  AppointmentDto,
} from './get_patient_appointments.response';
import { IAppointmentRepository } from 'src/domain/appointment/interfaces/appointment.repository.interface';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { IClinicRepository } from 'src/domain/clinic/interfaces/clinic.repository.interface';
import { Appointment } from 'src/domain/appointment/entities/appointment.entity';

@Injectable()
export class GetPatientAppointmentsHandler {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,

    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(
    query: GetPatientAppointmentsQuery,
  ): Promise<GetPatientAppointmentsResponse> {
    // Verify that patient exists
    const patient = await this.patientRepository.findById(query.patientId);
    if (!patient) {
      throw new NotFoundException(
        `Patient with id ${query.patientId} not found`,
      );
    }

    // Get all appointments for the patient
    let appointments: Appointment[] = [];
    let totalAppointments = 0;

    if (query.clinicId) {
      // If specific clinic is requested, get appointments for that clinic
      appointments = await this.appointmentRepository.findByPatient(
        query.clinicId,
        query.patientId,
      );

      // Filter by status if provided
      if (query.status && query.status.length > 0) {
        appointments = appointments.filter((a) =>
          query.status!.includes(a.status),
        );
      }

      // Filter by date range if provided
      if (query.startDate) {
        appointments = appointments.filter(
          (a) =>
            a.appointmentTime &&
            new Date(a.appointmentTime) >= new Date(query.startDate!),
        );
      }

      if (query.endDate) {
        appointments = appointments.filter(
          (a) =>
            a.appointmentTime &&
            new Date(a.appointmentTime) <= new Date(query.endDate!),
        );
      }

      totalAppointments = appointments.length;

      // Apply pagination
      const start = (query.page - 1) * query.limit;
      const end = start + query.limit;
      appointments = appointments.slice(start, end);
    } else {
      // Get appointments from all clinics
      // This would typically require a different repository method
      // For now, we'll simulate by gathering each clinic's appointments

      // Get all clinics related to the patient
      const patientClinics = await this.patientRepository.findAll({
        id: query.patientId,
      });

      let allAppointments: Appointment[] = [];

      // For each clinic, get the patient's appointments
      for (const clinic of patientClinics) {
        const clinicAppointments =
          await this.appointmentRepository.findByPatient(
            clinic.id,
            query.patientId,
          );
        allAppointments = [...allAppointments, ...clinicAppointments];
      }

      // Filter by status if provided
      if (query.status && query.status.length > 0) {
        allAppointments = allAppointments.filter((a) =>
          query.status!.includes(a.status),
        );
      }

      // Filter by date range if provided
      if (query.startDate) {
        allAppointments = allAppointments.filter(
          (a) =>
            a.appointmentTime &&
            new Date(a.appointmentTime) >= new Date(query.startDate!),
        );
      }

      if (query.endDate) {
        allAppointments = allAppointments.filter(
          (a) =>
            a.appointmentTime &&
            new Date(a.appointmentTime) <= new Date(query.endDate!),
        );
      }

      // Sort by appointment time, most recent first
      allAppointments.sort((a, b) => {
        const aTime = a.appointmentTime
          ? new Date(a.appointmentTime).getTime()
          : 0;
        const bTime = b.appointmentTime
          ? new Date(b.appointmentTime).getTime()
          : 0;
        return bTime - aTime;
      });

      totalAppointments = allAppointments.length;

      // Apply pagination
      const start = (query.page - 1) * query.limit;
      const end = start + query.limit;
      appointments = allAppointments.slice(start, end);
    }

    // Transform to DTOs and add clinic information
    const appointmentDtos: AppointmentDto[] = await Promise.all(
      appointments.map(async (appointment) => {
        const clinic = await this.clinicRepository.findById(
          appointment.clinicId,
        );

        return {
          id: appointment.id,
          clinicId: appointment.clinicId,
          clinicName: clinic?.name,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          // doctorName would come from a doctor repository if needed
          roomId: appointment.roomId,
          // roomName would come from a room repository if needed
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
      }),
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalAppointments / query.limit);

    // Return response with pagination metadata
    return {
      appointments: appointmentDtos,
      meta: {
        total: totalAppointments,
        page: query.page,
        limit: query.limit,
        totalPages: totalPages,
      },
    };
  }
}

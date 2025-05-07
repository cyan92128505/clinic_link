import { Inject, Injectable } from '@nestjs/common';
import { GetDashboardStatsQuery } from './get_dashboard_stats.query';
import { GetDashboardStatsResponse } from './get_dashboard_stats.response';
import { IAppointmentRepository } from '../../../../domain/appointment/interfaces/appointment.repository.interface';
import { IPatientClinicRepository } from '../../../../domain/patient/interfaces/patient_clinic.repository.interface';
import { AppointmentStatus } from '../../../../domain/appointment/value_objects/appointment.enum';
import { startOfDay, endOfDay, differenceInMinutes } from 'date-fns';
import { Appointment } from '../../../../domain/appointment/entities/appointment.entity';

@Injectable()
export class GetDashboardStatsHandler {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,
  ) {}

  async execute(
    query: GetDashboardStatsQuery,
  ): Promise<GetDashboardStatsResponse> {
    const { clinicId, date } = query;

    // Use provided date or default to today
    const targetDate = date || new Date();
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Get all appointments for the day
    // Since findByClinicAndDateRange doesn't exist in the interface,
    // we'll use findByDate which is available
    const appointments = await this.appointmentRepository.findByDate(
      clinicId,
      targetDate,
    );

    // Calculate appointment statistics
    const todayAppointments = appointments.length;

    // Count appointments by status
    const waitingPatients = this.countAppointmentsByStatus(appointments, [
      AppointmentStatus.CHECKED_IN,
      AppointmentStatus.SCHEDULED,
    ]);

    const completedAppointments = this.countAppointmentsByStatus(appointments, [
      AppointmentStatus.COMPLETED,
    ]);

    const cancelledAppointments = this.countAppointmentsByStatus(appointments, [
      AppointmentStatus.CANCELLED,
    ]);

    const noShowAppointments = this.countAppointmentsByStatus(appointments, [
      AppointmentStatus.NO_SHOW,
    ]);

    // Get new patients registered today
    // Since countNewPatientsByClinicAndDate doesn't exist in the interface,
    // we need to implement a workaround using available methods
    const allPatientClinics =
      await this.patientClinicRepository.findByClinic(clinicId);
    const newPatients = allPatientClinics.filter(
      (pc) => pc.firstVisitDate >= dayStart && pc.firstVisitDate <= dayEnd,
    ).length;

    // Calculate average wait time (from check-in to start)
    const { averageWaitTime, averageConsultationTime } =
      this.calculateAverageTimes(appointments);

    // Create and return response
    return GetDashboardStatsResponse.fromHandler({
      todayAppointments,
      waitingPatients,
      completedAppointments,
      cancelledAppointments,
      noShowAppointments,
      newPatients,
      averageWaitTime,
      averageConsultationTime,
    });
  }

  // Helper method to count appointments by status
  private countAppointmentsByStatus(
    appointments: Appointment[],
    statuses: AppointmentStatus[],
  ): number {
    return appointments.filter((apt) => statuses.includes(apt.status)).length;
  }

  // Helper method to calculate average times
  private calculateAverageTimes(appointments: Appointment[]): {
    averageWaitTime: number;
    averageConsultationTime: number;
  } {
    let totalWaitTime = 0;
    let waitTimeCount = 0;
    let totalConsultationTime = 0;
    let consultationTimeCount = 0;

    for (const apt of appointments) {
      // Calculate wait time (if patient has checked in and started consultation)
      if (apt.checkinTime && apt.startTime) {
        totalWaitTime += differenceInMinutes(
          new Date(apt.startTime),
          new Date(apt.checkinTime),
        );
        waitTimeCount++;
      }

      // Calculate consultation time (if consultation started and completed)
      if (apt.startTime && apt.endTime) {
        totalConsultationTime += differenceInMinutes(
          new Date(apt.endTime),
          new Date(apt.startTime),
        );
        consultationTimeCount++;
      }
    }

    // Compute average times
    const averageWaitTime =
      waitTimeCount > 0 ? Math.round(totalWaitTime / waitTimeCount) : 0;

    const averageConsultationTime =
      consultationTimeCount > 0
        ? Math.round(totalConsultationTime / consultationTimeCount)
        : 0;

    return { averageWaitTime, averageConsultationTime };
  }
}

// Response DTO for dashboard statistics
export class GetDashboardStatsResponse {
  // Total appointments for the day
  todayAppointments: number;

  // Patients currently waiting
  waitingPatients: number;

  // Completed appointments
  completedAppointments: number;

  // Cancelled appointments
  cancelledAppointments: number;

  // No-show appointments
  noShowAppointments: number;

  // New patients registered
  newPatients: number;

  // Average patient wait time (in minutes)
  averageWaitTime: number;

  // Average consultation time (in minutes)
  averageConsultationTime: number;

  constructor(data: {
    todayAppointments: number;
    waitingPatients: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    newPatients: number;
    averageWaitTime: number;
    averageConsultationTime: number;
  }) {
    this.todayAppointments = data.todayAppointments;
    this.waitingPatients = data.waitingPatients;
    this.completedAppointments = data.completedAppointments;
    this.cancelledAppointments = data.cancelledAppointments;
    this.noShowAppointments = data.noShowAppointments;
    this.newPatients = data.newPatients;
    this.averageWaitTime = data.averageWaitTime;
    this.averageConsultationTime = data.averageConsultationTime;
  }

  // Method to create a simplified response
  toSimpleResponse() {
    return {
      todayAppointments: this.todayAppointments,
      waitingPatients: this.waitingPatients,
      completedAppointments: this.completedAppointments,
    };
  }

  // Method to calculate appointment-related percentages
  calculateAppointmentPercentages() {
    const total = this.todayAppointments;
    return {
      completedRate:
        total > 0 ? Math.round((this.completedAppointments / total) * 100) : 0,
      cancelledRate:
        total > 0 ? Math.round((this.cancelledAppointments / total) * 100) : 0,
      noShowRate:
        total > 0 ? Math.round((this.noShowAppointments / total) * 100) : 0,
    };
  }

  // Static method to create response from handler result
  static fromHandler(result: {
    todayAppointments: number;
    waitingPatients: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    newPatients: number;
    averageWaitTime: number;
    averageConsultationTime: number;
  }): GetDashboardStatsResponse {
    return new GetDashboardStatsResponse(result);
  }

  // Method to provide a narrative summary
  getNarrativeSummary(): string {
    const percentages = this.calculateAppointmentPercentages();
    return (
      `今日總掛號 ${this.todayAppointments} 人，` +
      `已完成 ${this.completedAppointments} 人（${percentages.completedRate}%），` +
      `取消 ${this.cancelledAppointments} 人（${percentages.cancelledRate}%），` +
      `未到診 ${this.noShowAppointments} 人（${percentages.noShowRate}%）。` +
      `平均候診時間 ${this.averageWaitTime} 分鐘，` +
      `平均看診時間 ${this.averageConsultationTime} 分鐘。`
    );
  }
}

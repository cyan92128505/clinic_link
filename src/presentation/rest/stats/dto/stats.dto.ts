import { ApiProperty } from '@nestjs/swagger';
import { GetDashboardStatsResponse } from '../../../../usecases/stats/queries/get_dashboard_stats/get_dashboard_stats.response';

/**
 * DTO for dashboard statistics response
 */
export class DashboardStatsResponseDto {
  @ApiProperty({
    description: 'Total number of appointments for the day',
    example: 50,
  })
  todayAppointments: number;

  @ApiProperty({
    description: 'Number of patients currently waiting',
    example: 10,
  })
  waitingPatients: number;

  @ApiProperty({
    description: 'Number of completed appointments',
    example: 25,
  })
  completedAppointments: number;

  @ApiProperty({
    description: 'Number of cancelled appointments',
    example: 5,
  })
  cancelledAppointments: number;

  @ApiProperty({
    description: 'Number of no-show appointments',
    example: 3,
  })
  noShowAppointments: number;

  @ApiProperty({
    description: 'Number of new patients registered today',
    example: 8,
  })
  newPatients: number;

  @ApiProperty({
    description: 'Average patient waiting time in minutes',
    example: 15.5,
  })
  averageWaitTime: number;

  @ApiProperty({
    description: 'Average consultation time in minutes',
    example: 12.3,
  })
  averageConsultationTime: number;

  @ApiProperty({
    description: 'Appointment statistics percentages',
    example: {
      completedRate: 50,
      cancelledRate: 10,
      noShowRate: 6,
    },
    // 修正：添加必要的 schema 定義
    type: 'object',
    additionalProperties: false,
    properties: {
      completedRate: { type: 'number' },
      cancelledRate: { type: 'number' },
      noShowRate: { type: 'number' },
    },
  })
  percentages: {
    completedRate: number;
    cancelledRate: number;
    noShowRate: number;
  };

  @ApiProperty({
    description: "Narrative summary of today's statistics",
    example:
      '今日總掛號 50 人，已完成 25 人（50%），取消 5 人（10%），未到診 3 人（6%）。平均候診時間 15.5 分鐘，平均看診時間 12.3 分鐘。',
  })
  summary: string;

  constructor(stats: GetDashboardStatsResponse) {
    this.todayAppointments = stats.todayAppointments;
    this.waitingPatients = stats.waitingPatients;
    this.completedAppointments = stats.completedAppointments;
    this.cancelledAppointments = stats.cancelledAppointments;
    this.noShowAppointments = stats.noShowAppointments;
    this.newPatients = stats.newPatients;
    this.averageWaitTime = stats.averageWaitTime;
    this.averageConsultationTime = stats.averageConsultationTime;
    this.percentages = stats.calculateAppointmentPercentages();
    this.summary = stats.getNarrativeSummary();
  }
}

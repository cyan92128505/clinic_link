import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    super({
      log:
        configService.get('NODE_ENV') === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  /**
   * Connect to the database when the module is initialized
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Disconnect from the database when the module is destroyed
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Clean the database for testing (only in test environment)
   */
  async cleanDatabase() {
    if (this.configService.get('NODE_ENV') !== 'test') {
      throw new Error('Database cleaning is only allowed in test environment');
    }

    // The transaction ensures all deletions happen as a single atomic operation
    return this.$transaction([
      this.activityLog.deleteMany(),
      this.appointment.deleteMany(),
      this.doctorRoom.deleteMany(),
      this.room.deleteMany(),
      this.doctor.deleteMany(),
      this.department.deleteMany(),
      this.patient.deleteMany(),
      this.userClinic.deleteMany(),
      this.user.deleteMany(),
      this.clinic.deleteMany(),
    ]);
  }
}

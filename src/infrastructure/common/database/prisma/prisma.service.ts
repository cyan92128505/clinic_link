import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const hideHealthCheckQueries =
      configService.get('PRISMA_HIDE_HEALTH_CHECK_QUERIES') === 'true';
    const connectionLimit = parseInt(
      configService.get('PRISMA_CONNECTION_LIMIT', '5'),
    );

    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
      log:
        configService.get('NODE_ENV') === 'development'
          ? [
              {
                emit: hideHealthCheckQueries ? 'event' : 'stdout',
                level: 'query',
              },
              { emit: 'stdout', level: 'info' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : [configService.get('PRISMA_LOG_LEVEL', 'warn')],
    });
  }

  /**
   * Connect to the database when the module is initialized
   */
  async onModuleInit() {
    if (this.configService.get('NODE_ENV') === 'development') {
      // Only log slow queries in development
      this.$on('query' as never, (e: any) => {
        if (e.duration > 200) {
          // Only log queries taking more than 200ms
          console.log(`Slow query (${e.duration}ms): ${e.query}`);
        }
      });
    }

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

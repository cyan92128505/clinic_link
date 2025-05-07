import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyPatientTokenCommand } from './verify_patient_token.command';
import { IPatientRepository } from 'src/domain/patient/interfaces/patient.repository.interface';
import { Patient } from 'src/domain/patient/entities/patient.entity';

// Firebase Admin interface
interface IFirebaseAdminService {
  verifyIdToken(token: string): Promise<{
    uid: string;
    email?: string;
    phone_number?: string;
    name?: string;
  }>;
}

@Injectable()
@CommandHandler(VerifyPatientTokenCommand)
export class VerifyPatientTokenHandler
  implements ICommandHandler<VerifyPatientTokenCommand>
{
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,

    @Inject('IFirebaseAdminService')
    private readonly firebaseAdminService: IFirebaseAdminService,
  ) {}

  async execute(command: VerifyPatientTokenCommand) {
    const { idToken, ipAddress, userAgent } = command;

    try {
      // Verify Firebase token
      const decodedToken =
        await this.firebaseAdminService.verifyIdToken(idToken);

      // Find patient by Firebase UID
      const patient = await this.patientRepository.findByFirebaseUid(
        decodedToken.uid,
      );

      // If patient not found, throw unauthorized exception
      if (!patient) {
        throw new UnauthorizedException('Patient not registered');
      }

      // Optional: Log authentication attempt
      // This could be integrated with an activity log system
      this.logAuthenticationAttempt(patient, {
        success: true,
        ipAddress,
        userAgent,
      });

      // Return patient information along with token details
      return {
        patient,
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        phoneNumber: decodedToken.phone_number,
      };
    } catch (error) {
      if (error instanceof Error) {
        // Log failed authentication attempt
        this.logAuthenticationAttempt(null, {
          success: false,
          ipAddress,
          userAgent,
          errorMessage: error.message,
        });
      }

      // Rethrow or transform the error
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Generic unauthorized error for token verification failures
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  // Optional method for logging authentication attempts
  private logAuthenticationAttempt(
    patient: Patient | null,
    details: {
      success: boolean;
      ipAddress?: string;
      userAgent?: string;
      errorMessage?: string;
    },
  ) {
    // Placeholder for actual logging mechanism
    // Could be integrated with ActivityLog or a dedicated auth log system
    console.log('Auth Attempt:', {
      patientId: patient?.id,
      ...details,
    });
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import * as admin from 'firebase-admin';

@Injectable()
export class PatientFirebaseStrategy extends PassportStrategy(
  Strategy,
  'patient-firebase',
) {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super();

    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      const firebaseConfig = {
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
        privateKey: this.configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
        clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
      });
    }
  }

  /**
   * Validate Firebase ID token from request
   */
  async validate(request: Request): Promise<any> {
    // Extract the token from the Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const idToken = authHeader.split(' ')[1];

    try {
      // Verify the Firebase token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid } = decodedToken;

      // Find patient by Firebase UID
      const patient = await this.prismaService.patient.findUnique({
        where: { firebaseUid: uid },
      });

      if (!patient) {
        throw new UnauthorizedException('Patient not registered in the system');
      }

      // Return patient data to be set in request
      return {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        firebaseUid: patient.firebaseUid,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

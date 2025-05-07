// infrastructure/auth/firebase-admin.service.ts

import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { IFirebaseAdminService } from 'src/domain/auth/interfaces/firebase_admin_service.interface';

@Injectable()
export class FirebaseAdminService implements IFirebaseAdminService {
  async verifyIdToken(token: string): Promise<{
    uid: string;
    email?: string;
    phone_number?: string;
    name?: string;
  }> {
    const decoded = await admin.auth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      phone_number: decoded.phone_number,
      name: `${decoded.name}`,
    };
  }
}

// Firebase Admin interface
export interface IFirebaseAdminService {
  verifyIdToken(token: string): Promise<{
    uid: string;
    email?: string;
    phone_number?: string;
    name?: string;
  }>;
}

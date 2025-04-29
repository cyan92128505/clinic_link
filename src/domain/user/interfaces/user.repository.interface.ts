import { User } from '../entities/user.entity';
import { UserClinic } from '../entities/user-clinic.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: User): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<boolean>;
  addToClinic(userClinic: UserClinic): Promise<UserClinic>;
  removeFromClinic(userId: string, clinicId: string): Promise<boolean>;
  updateClinicRole(
    userId: string,
    clinicId: string,
    role: string,
  ): Promise<UserClinic>;
  findByClinic(clinicId: string): Promise<User[]>;
}

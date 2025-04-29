import { Doctor } from '../entities/doctor.entity';

export interface IDoctorRepository {
  findById(id: string, clinicId: string): Promise<Doctor | null>;
  findAll(clinicId: string): Promise<Doctor[]>;
  create(doctor: Doctor): Promise<Doctor>;
  update(id: string, clinicId: string, data: Partial<Doctor>): Promise<Doctor>;
  delete(id: string, clinicId: string): Promise<boolean>;
  findByDepartment(clinicId: string, departmentId: string): Promise<Doctor[]>;
  findByUser(clinicId: string, userId: string): Promise<Doctor | null>;
  assignRoom(doctorId: string, roomId: string): Promise<boolean>;
  removeRoom(doctorId: string, roomId: string): Promise<boolean>;
  findByRoom(clinicId: string, roomId: string): Promise<Doctor[]>;
}

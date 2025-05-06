import { Doctor } from '../../../../domain/doctor/entities/doctor.entity';

/**
 * DTO for doctor information
 */
export class DoctorDto {
  id: string;
  name: string;
  departmentId: string;
  title?: string;
  specialty?: string;
  licenseNumber?: string;
  bio?: string;
  avatar?: string;
  userId?: string;
  scheduleData?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(doctor: Doctor) {
    this.id = doctor.id;
    this.name = doctor.name;
    this.departmentId = doctor.departmentId;
    this.title = doctor.title;
    this.specialty = doctor.specialty;
    this.licenseNumber = doctor.licenseNumber;
    this.bio = doctor.bio;
    this.avatar = doctor.avatar;
    this.userId = doctor.userId;
    this.scheduleData = doctor.scheduleData;
    this.createdAt = doctor.createdAt;
    this.updatedAt = doctor.updatedAt;
  }
}

/**
 * Response structure for doctors query
 */
export class GetDoctorsResponse {
  doctors: DoctorDto[];

  constructor(doctors: DoctorDto[]) {
    this.doctors = doctors;
  }
}

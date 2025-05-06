import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IDoctorRepository } from '../../../../domain/doctor/interfaces/doctor.repository.interface';
import { IClinicRepository } from '../../../../domain/clinic/interfaces/clinic.repository.interface';
import { IDepartmentRepository } from '../../../../domain/department/interfaces/department.repository.interface';
import { IRoomRepository } from '../../../../domain/room/interfaces/room.repository.interface';
import { GetDoctorsQuery } from './get_doctors.query';
import { DoctorDto, GetDoctorsResponse } from './get_doctors.response';

/**
 * Handler for retrieving doctors in a clinic with optional filtering
 */
@Injectable()
export class GetDoctorsHandler {
  private readonly logger = new Logger(GetDoctorsHandler.name);

  constructor(
    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,

    @Inject('IClinicRepository')
    private readonly clinicRepository: IClinicRepository,

    @Inject('IDepartmentRepository')
    private readonly departmentRepository: IDepartmentRepository,

    @Inject('IRoomRepository')
    private readonly roomRepository: IRoomRepository,
  ) {}

  /**
   * Execute the query to retrieve doctors for a clinic
   * @param query Query parameters including clinic ID and optional filters
   * @returns List of doctors in the specified clinic
   */
  async execute(query: GetDoctorsQuery): Promise<GetDoctorsResponse> {
    this.logger.debug(`Getting doctors for clinic: ${query.clinicId}`);

    // Verify clinic exists
    const clinic = await this.clinicRepository.findById(query.clinicId);
    if (!clinic) {
      this.logger.warn(`Clinic not found with ID: ${query.clinicId}`);
      throw new NotFoundException('Clinic not found');
    }

    // If departmentId is provided, verify it exists
    if (query.departmentId) {
      const department = await this.departmentRepository.findById(
        query.departmentId,
        query.clinicId,
      );
      if (!department) {
        this.logger.warn(`Department not found with ID: ${query.departmentId}`);
        throw new NotFoundException('Department not found');
      }
    }

    // If roomId is provided, verify it exists
    if (query.roomId) {
      const room = await this.roomRepository.findById(
        query.roomId,
        query.clinicId,
      );
      if (!room) {
        this.logger.warn(`Room not found with ID: ${query.roomId}`);
        throw new NotFoundException('Room not found');
      }
    }

    // Get doctors based on filters
    let doctors;
    if (query.departmentId) {
      // Get doctors filtered by department
      doctors = await this.doctorRepository.findByDepartment(
        query.clinicId,
        query.departmentId,
      );
      this.logger.debug(
        `Found ${doctors.length} doctors in department: ${query.departmentId}`,
      );
    } else if (query.roomId) {
      // Get doctors filtered by room
      doctors = await this.doctorRepository.findByRoom(
        query.clinicId,
        query.roomId,
      );
      this.logger.debug(
        `Found ${doctors.length} doctors assigned to room: ${query.roomId}`,
      );
    } else {
      // Get all doctors for the clinic
      doctors = await this.doctorRepository.findAll(query.clinicId);
      this.logger.debug(
        `Found ${doctors.length} doctors in clinic: ${query.clinicId}`,
      );
    }

    // Map to DTOs
    const doctorDtos = doctors.map((doctor) => new DoctorDto(doctor));

    return new GetDoctorsResponse(doctorDtos);
  }
}

import { Department } from '../entities/department.entity';

export interface IDepartmentRepository {
  findById(id: string, clinicId: string): Promise<Department | null>;
  findAll(clinicId: string): Promise<Department[]>;
  create(department: Department): Promise<Department>;
  update(
    id: string,
    clinicId: string,
    data: Partial<Department>,
  ): Promise<Department>;
  delete(id: string, clinicId: string): Promise<boolean>;
}

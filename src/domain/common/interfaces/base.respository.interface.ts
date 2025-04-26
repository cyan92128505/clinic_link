/**
 * Base repository interface that supports multi-tenancy
 * All operations require a tenantId (clinicId) to ensure data isolation
 */
export interface IBaseRepository<T> {
  findById(id: string, tenantId: string): Promise<T | null>;
  findAll(tenantId: string): Promise<T[]>;
  create(data: T, tenantId: string): Promise<T>;
  update(id: string, data: Partial<T>, tenantId: string): Promise<T>;
  delete(id: string, tenantId: string): Promise<boolean>;
}

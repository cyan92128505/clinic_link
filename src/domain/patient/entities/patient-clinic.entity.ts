import { BaseEntity } from 'src/domain/common/entities/base.entity';

export class PatientClinic extends BaseEntity {
  patientId: string;
  clinicId: string;
  patientNumber?: string;
  medicalHistory?: Record<string, any>;
  note?: string;
  firstVisitDate: Date;
  lastVisitDate: Date;
  isActive: boolean;

  constructor(props: Partial<PatientClinic>) {
    super({
      id: `${props.patientId}-${props.clinicId}`, // Composite ID
    });
    Object.assign(this, props);

    // Set default values if not provided
    this.firstVisitDate = props.firstVisitDate || new Date();
    this.lastVisitDate = props.lastVisitDate || new Date();
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public updateLastVisitDate(): void {
    this.lastVisitDate = new Date();
    this.updatedAt = new Date();
  }

  public toggleStatus(): void {
    this.isActive = !this.isActive;
    this.updatedAt = new Date();
  }
}

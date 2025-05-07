/**
 * DoctorRoom join entity - represents relationship between doctors and rooms
 */
export class DoctorRoom {
  doctorId!: string;
  roomId!: string;
  createdAt: Date;

  constructor(props: Partial<DoctorRoom>) {
    Object.assign(this, props);

    // Set default values if not provided
    this.createdAt = props.createdAt || new Date();
  }
}

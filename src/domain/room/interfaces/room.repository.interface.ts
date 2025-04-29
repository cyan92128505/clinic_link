import { Room } from '../entities/room.entity';

export interface IRoomRepository {
  findById(id: string, clinicId: string): Promise<Room | null>;
  findAll(clinicId: string): Promise<Room[]>;
  create(room: Room): Promise<Room>;
  update(id: string, clinicId: string, data: Partial<Room>): Promise<Room>;
  delete(id: string, clinicId: string): Promise<boolean>;
  updateStatus(id: string, clinicId: string, status: string): Promise<Room>;
  findByDoctor(clinicId: string, doctorId: string): Promise<Room[]>;
  findByStatus(clinicId: string, status: string): Promise<Room[]>;
}

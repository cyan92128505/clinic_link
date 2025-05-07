import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IRoomRepository } from '../../../domain/room/interfaces/room.repository.interface';
import { Room } from '../../../domain/room/entities/room.entity';
import { RoomStatus } from '../../../domain/room/value_objects/room.enum';
import { Prisma } from '@prisma/client';

// 定義 Prisma Room 模型的型別
interface PrismaRoom {
  id: string;
  clinicId: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaRoomRepository implements IRoomRepository {
  private readonly logger = new Logger(PrismaRoomRepository.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Helper method to check if an error is an Error object
   */
  private isError(error: unknown): error is Error {
    return error instanceof Error;
  }

  /**
   * Find all rooms in a clinic
   */
  async findAll(clinicId: string): Promise<Room[]> {
    try {
      const rooms = await this.prisma.room.findMany({
        where: {
          clinicId,
        },
        orderBy: [{ name: 'asc' }],
      });

      return rooms.map((room) => this.mapToDomainEntity(room as PrismaRoom));
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(`Error finding all rooms: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Find room by ID
   */
  async findById(id: string, clinicId: string): Promise<Room | null> {
    try {
      const room = await this.prisma.room.findFirst({
        where: {
          id,
          clinicId,
        },
      });

      if (!room) {
        return null;
      }

      return this.mapToDomainEntity(room as PrismaRoom);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding room by ID: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Create a new room
   */
  async create(room: Room): Promise<Room> {
    try {
      const createdRoom = await this.prisma.room.create({
        data: {
          id: room.id,
          clinicId: room.clinicId,
          name: room.name,
          description: room.description,
          status: room.status,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        },
      });

      return this.mapToDomainEntity(createdRoom as PrismaRoom);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(`Error creating room: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Update an existing room
   */
  async update(
    id: string,
    clinicId: string,
    data: Partial<Room>,
  ): Promise<Room> {
    try {
      const updatedRoom = await this.prisma.room.update({
        where: {
          id,
          clinicId,
        },
        data: data as Prisma.RoomUpdateInput,
      });

      return this.mapToDomainEntity(updatedRoom as PrismaRoom);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(`Error updating room: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Delete a room
   */
  async delete(id: string, clinicId: string): Promise<boolean> {
    try {
      const deletedRoom = await this.prisma.room.delete({
        where: {
          id,
          clinicId,
        },
      });

      return deletedRoom != null;
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(`Error deleting room: ${errorMessage}`, errorStack);
      return false;
    }
  }

  /**
   * Update room status
   */
  async updateStatus(
    id: string,
    clinicId: string,
    status: string,
  ): Promise<Room> {
    try {
      const updatedRoom = await this.prisma.room.update({
        where: {
          id,
          clinicId,
        },
        data: {
          status: status as RoomStatus,
          updatedAt: new Date(),
        },
      });

      return this.mapToDomainEntity(updatedRoom as PrismaRoom);
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error updating room status: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find rooms by doctor
   */
  async findByDoctor(clinicId: string, doctorId: string): Promise<Room[]> {
    try {
      // First get the roomIds associated with the doctor
      const doctorRooms = await this.prisma.doctorRoom.findMany({
        where: {
          doctorId,
        },
        select: {
          roomId: true,
        },
      });

      // Extract roomIds from the doctor-room relationships
      const roomIds = doctorRooms.map((dr) => dr.roomId);

      // Then fetch the actual rooms that belong to the specified clinic
      const rooms = await this.prisma.room.findMany({
        where: {
          id: {
            in: roomIds,
          },
          clinicId,
        },
      });

      return rooms.map((room) => this.mapToDomainEntity(room as PrismaRoom));
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding rooms by doctor: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find rooms by status
   */
  async findByStatus(clinicId: string, status: string): Promise<Room[]> {
    try {
      const rooms = await this.prisma.room.findMany({
        where: {
          clinicId,
          status: status as RoomStatus,
        },
        orderBy: [{ name: 'asc' }],
      });

      return rooms.map((room) => this.mapToDomainEntity(room as PrismaRoom));
    } catch (error: unknown) {
      const errorMessage = this.isError(error) ? error.message : '未知錯誤';
      const errorStack = this.isError(error) ? error.stack : undefined;

      this.logger.error(
        `Error finding rooms by status: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  // Helper method to map Prisma model to domain entity
  private mapToDomainEntity(prismaRoom: PrismaRoom): Room {
    return new Room({
      id: prismaRoom.id,
      clinicId: prismaRoom.clinicId,
      name: prismaRoom.name,
      description: prismaRoom.description || undefined,
      status: prismaRoom.status as RoomStatus,
      createdAt: prismaRoom.createdAt,
      updatedAt: prismaRoom.updatedAt,
    });
  }
}

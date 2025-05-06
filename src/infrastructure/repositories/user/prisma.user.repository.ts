import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma/prisma.service';
import { IUserRepository } from '../../../domain/user/interfaces/user.repository.interface';
import { User } from '../../../domain/user/entities/user.entity';
import { UserClinic } from '../../../domain/user/entities/user_clinic.entity';
import { Role } from '../../../domain/user/value_objects/role.enum';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  private readonly logger = new Logger(PrismaUserRepository.name);

  constructor(private prisma: PrismaService) {}

  async findByIds(ids: String[]): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          id: ids.join(','),
        },
      });

      if (!users) {
        return [];
      }

      return users.map((user) => this.mapToDomainEntity(user));
    } catch (error) {
      this.logger.error(
        `Error finding user by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find all users
   */
  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: [{ name: 'asc' }],
      });

      // Map Prisma model to domain entity
      return users.map((user) => this.mapToDomainEntity(user));
    } catch (error) {
      this.logger.error(
        `Error finding all users: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          clinics: true, // 包含用戶診所關聯
        },
      });

      if (!user) {
        return null;
      }

      return this.mapToDomainEntityWithClinics(user);
    } catch (error) {
      this.logger.error(
        `Error finding user by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
        include: {
          clinics: true, // 包含用戶診所關聯
        },
      });

      if (!user) {
        return null;
      }

      return this.mapToDomainEntityWithClinics(user);
    } catch (error) {
      this.logger.error(
        `Error finding user by email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async create(user: User): Promise<User> {
    try {
      const createdUser = await this.prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });

      return this.mapToDomainEntity(createdUser);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an existing user
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    try {
      // 從更新資料中排除 clinics 屬性，因為 Prisma 需要特定的格式
      const { clinics, ...updateData } = data;

      const updatedUser = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: updateData,
      });

      // 如果需要更新 clinics 關聯，應該使用單獨的方法

      return this.mapToDomainEntity(updatedUser);
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: {
          id: id,
        },
      });

      return deletedUser != null;
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Add user to clinic with specific role
   */
  async addToClinic(userClinic: UserClinic): Promise<UserClinic> {
    try {
      const createdUserClinic = await this.prisma.userClinic.create({
        data: {
          userId: userClinic.userId,
          clinicId: userClinic.clinicId,
          role: userClinic.role,
          createdAt: userClinic.createdAt,
          updatedAt: userClinic.updatedAt,
        },
      });

      return this.mapToUserClinicEntity(createdUserClinic);
    } catch (error) {
      this.logger.error(
        `Error adding user to clinic: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Remove user from clinic
   */
  async removeFromClinic(userId: string, clinicId: string): Promise<boolean> {
    try {
      const deletedUserClinic = await this.prisma.userClinic.delete({
        where: {
          userId_clinicId: {
            userId: userId,
            clinicId: clinicId,
          },
        },
      });

      return deletedUserClinic != null;
    } catch (error) {
      this.logger.error(
        `Error removing user from clinic: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Update user's role in a clinic
   */
  async updateClinicRole(
    userId: string,
    clinicId: string,
    role: string,
  ): Promise<UserClinic> {
    try {
      const updatedUserClinic = await this.prisma.userClinic.update({
        where: {
          userId_clinicId: {
            userId: userId,
            clinicId: clinicId,
          },
        },
        data: {
          role: role as Role,
          updatedAt: new Date(),
        },
      });

      return this.mapToUserClinicEntity(updatedUserClinic);
    } catch (error) {
      this.logger.error(
        `Error updating user clinic role: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find all users associated with a specific clinic
   */
  async findByClinic(clinicId: string): Promise<User[]> {
    try {
      const userClinics = await this.prisma.userClinic.findMany({
        where: {
          clinicId: clinicId,
        },
        include: {
          user: true,
        },
      });

      // 這裡也應該包含用戶的診所關聯
      const users = [] as Array<User>;
      for (const userClinic of userClinics) {
        const user = await this.findById(userClinic.userId);
        if (user) {
          users.push(user);
        }
      }

      return users;
    } catch (error) {
      this.logger.error(
        `Error finding users by clinic: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Helper method to map Prisma model to domain entity
  private mapToDomainEntity(prismaUser: any): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      name: prismaUser.name,
      phone: prismaUser.phone,
      avatar: prismaUser.avatar,
      isActive: prismaUser.isActive,
      lastLoginAt: prismaUser.lastLoginAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  // 新增映射方法，包括用戶診所關聯
  private mapToDomainEntityWithClinics(prismaUser: any): User {
    const user = this.mapToDomainEntity(prismaUser);

    // 映射診所關聯
    if (prismaUser.clinics && Array.isArray(prismaUser.clinics)) {
      user.clinics = prismaUser.clinics.map(
        (clinic) =>
          new UserClinic({
            userId: clinic.userId,
            clinicId: clinic.clinicId,
            role: clinic.role,
            createdAt: clinic.createdAt,
            updatedAt: clinic.updatedAt,
          }),
      );
    }

    return user;
  }

  // Helper method to map Prisma model to UserClinic entity
  private mapToUserClinicEntity(prismaUserClinic: any): UserClinic {
    return new UserClinic({
      userId: prismaUserClinic.userId,
      clinicId: prismaUserClinic.clinicId,
      role: prismaUserClinic.role as Role,
      createdAt: prismaUserClinic.createdAt,
      updatedAt: prismaUserClinic.updatedAt,
    });
  }
}

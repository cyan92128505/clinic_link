import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

// 定義使用者類型
interface UserClinic {
  id: string;
  role: Role;
  // 其他可能屬性
}

interface User {
  id: string;
  clinics: UserClinic[];
  // 其他使用者屬性
}

// 擴展 Request 類型
interface RequestWithUser extends Request {
  user: User;
  headers: Request['headers'] & {
    'x-clinic-id'?: string;
  };
  query: {
    clinicId?: string;
    [key: string]: any;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Check if the user has the required roles for the current clinic
   */
  canActivate(context: ExecutionContext): boolean {
    // Get required roles for the route
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const clinicId = request.headers['x-clinic-id'] || request.query.clinicId;

    // If no clinic ID is provided, deny access
    if (!clinicId) {
      throw new ForbiddenException(
        'Clinic ID is required for role-based access',
      );
    }

    // If user is a system ADMIN, allow access to everything
    if (user.clinics.some((c: UserClinic) => c.role === Role.ADMIN)) {
      return true;
    }

    // Check if user has required role for the specified clinic
    const userClinic = user.clinics.find((c: UserClinic) => c.id === clinicId);
    if (!userClinic) {
      throw new ForbiddenException('You do not have access to this clinic');
    }

    const hasRequiredRole = requiredRoles.some(
      (role) => userClinic.role === role,
    );
    if (!hasRequiredRole) {
      throw new ForbiddenException(
        'You do not have the required role for this operation',
      );
    }

    return true;
  }
}

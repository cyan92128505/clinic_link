import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllRolesQuery } from './get_all_roles.query';
import { Role } from 'src/domain/user/value_objects/role.enum';

// Detailed role description interface
interface RoleDescription {
  value: Role;
  label: string;
  description: string;
}

@Injectable()
@QueryHandler(GetAllRolesQuery)
export class GetAllRolesHandler implements IQueryHandler<GetAllRolesQuery> {
  // Predefined role descriptions
  private readonly roleDescriptions: RoleDescription[] = [
    {
      value: Role.ADMIN,
      label: '系統管理員',
      description: '擁有系統最高權限，可管理所有診所和使用者',
    },
    {
      value: Role.CLINIC_ADMIN,
      label: '診所管理員',
      description: '管理特定診所的使用者、設定和基本營運',
    },
    {
      value: Role.DOCTOR,
      label: '醫生',
      description: '可查看和管理患者看診記錄、預約和基本診療資訊',
    },
    {
      value: Role.NURSE,
      label: '護士',
      description: '協助醫生進行患者登記、看診流程管理和基本醫療支援',
    },
    {
      value: Role.STAFF,
      label: '一般員工',
      description: '基本診所營運支援，權限較為受限',
    },
    {
      value: Role.RECEPTIONIST,
      label: '櫃檯人員',
      description: '負責患者掛號、預約管理和基本客戶服務',
    },
  ];

  constructor() {}

  async execute(query: GetAllRolesQuery) {
    const { requestedBy } = query;

    // Access control
    // Only allow authenticated users to access roles
    if (!requestedBy) {
      throw new UnauthorizedException(
        'Authentication required to access roles',
      );
    }

    // Basic access control - you might want to adjust based on your specific requirements
    const allowedRoles = [Role.ADMIN, Role.CLINIC_ADMIN];

    if (!allowedRoles.includes(requestedBy.userRole as Role)) {
      throw new UnauthorizedException('Insufficient permissions to view roles');
    }

    return {
      roles: this.roleDescriptions,
    };
  }
}

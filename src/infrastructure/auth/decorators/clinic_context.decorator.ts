import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Define an interface for the user object with the properties we need
interface RequestWithUser extends Request {
  user: {
    selectedClinicId: string;
    [key: string]: any; // 允許其他未知屬性
  };
}

export const ClinicContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    // 明確指定 request 的型別
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    // 使用型別保護確保 user 和 selectedClinicId 存在
    if (!request.user || !request.user.selectedClinicId) {
      throw new Error(
        'Clinic context not available. Make sure a clinic is selected.',
      );
    }

    // 明確型別的返回值
    return request.user.selectedClinicId;
  },
);

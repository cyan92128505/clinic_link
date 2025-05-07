import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// 定義使用者介面，可根據實際情況調整
interface User {
  id: string;
  email: string;
  // 其他使用者屬性
  [key: string]: any;
}

// 擴展 Request 介面以包含 user 屬性
interface RequestWithUser extends Request {
  user: User;
}

/**
 * Parameter decorator that extracts the user object from request
 * Usage: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator that extracts the user object from request
 * Usage: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

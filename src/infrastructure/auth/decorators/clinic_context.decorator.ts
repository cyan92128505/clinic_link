import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClinicContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    // Get the selected clinic ID from the user object in the request
    // This assumes that the JWT authentication guard has already attached the user to the request
    // and that the user has a selectedClinicId property
    if (!request.user || !request.user.selectedClinicId) {
      throw new Error(
        'Clinic context not available. Make sure a clinic is selected.',
      );
    }

    return request.user.selectedClinicId;
  },
);

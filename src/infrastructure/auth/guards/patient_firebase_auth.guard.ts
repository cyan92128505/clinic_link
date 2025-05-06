import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PatientFirebaseAuthGuard extends AuthGuard('patient-firebase') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Check if the route is public or requires authentication
   */
  canActivate(context: ExecutionContext) {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // For non-public routes, proceed with Firebase JWT validation
    return super.canActivate(context);
  }

  /**
   * Handle unauthorized access
   */
  handleRequest(err: any, patient: any) {
    if (err || !patient) {
      throw (
        err ||
        new UnauthorizedException(
          'You are not authorized to access this resource',
        )
      );
    }

    // Set the patient object in the request for use in controllers
    return patient;
  }
}

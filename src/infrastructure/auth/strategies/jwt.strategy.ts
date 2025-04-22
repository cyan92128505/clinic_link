import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/database/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    // Explicitly cast to string to resolve TypeScript error
    // Use a default value to ensure it's never undefined
    const secretKey =
      configService.get<string>('JWT_SECRET') || 'fallback-secret-for-dev-only';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  /**
   * Validate JWT payload and return user data
   */
  async validate(payload: any) {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
      include: {
        clinics: {
          include: {
            clinic: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      clinics: user.clinics.map((uc) => ({
        id: uc.clinicId,
        name: uc.clinic.name,
        role: uc.role,
      })),
    };
  }
}

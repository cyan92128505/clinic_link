import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/database/prisma/prisma.service';

// 定義 JWT 載荷介面
interface JwtPayload {
  sub: string; // 使用者 ID
  email: string;
  name: string;
  iat?: number; // 簽發時間
  exp?: number; // 到期時間
}

// 定義返回的使用者結構
interface UserResponse {
  id: string;
  email: string;
  name: string;
  clinics: {
    id: string;
    name: string;
    role: string;
  }[];
}

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
  async validate(payload: JwtPayload): Promise<UserResponse> {
    // 現在 payload 有明確的型別，可以安全地訪問 payload.sub
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

    // 返回值也有明確的型別
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

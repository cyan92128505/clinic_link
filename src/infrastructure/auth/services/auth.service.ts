import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import { IAuthService } from '../../../domain/auth/interfaces/auth_service.interface';
import { PrismaService } from '../../common/database/prisma/prisma.service';

// 定義使用者介面
interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // 改為可選屬性
  [key: string]: any;
}

// JWT 載荷介面
interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  private firebaseApp: admin.app.App | null = null; // 初始化為 null

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      try {
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        const privateKey = this.configService.get<string>(
          'FIREBASE_PRIVATE_KEY',
        )
          ? this.configService
              .get<string>('FIREBASE_PRIVATE_KEY')
              ?.replace(/\\n/g, '\n')
          : undefined;
        const clientEmail = this.configService.get<string>(
          'FIREBASE_CLIENT_EMAIL',
        );

        if (projectId && privateKey && clientEmail) {
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              privateKey,
              clientEmail,
            }),
          });
          this.logger.log('Firebase Admin SDK initialized');
        } else {
          this.logger.warn(
            'Firebase credentials not provided, Firebase authentication disabled',
          );
        }
      } catch (error: unknown) {
        // 使用型別斷言
        if (error instanceof Error) {
          this.logger.error(
            `Error initializing Firebase Admin SDK: ${error.message}`,
          );
        } else {
          this.logger.error(
            'Error initializing Firebase Admin SDK: Unknown error',
          );
        }
      }
    } else {
      this.firebaseApp = admin.app();
    }
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
        include: {
          clinics: {
            include: {
              clinic: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await this.comparePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        return null;
      }

      // Update last login time
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Remove password from returned user object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: passwordValue, ...result } = user;

      // 使用型別斷言，確保型別正確
      return result as unknown as User;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error validating user: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error validating user: Unknown error');
      }
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    // 使用 await 避免 ESLint 警告
    return await this.jwtService.signAsync(payload);
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      // 使用 await 避免 ESLint 警告
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error verifying JWT token: ${error.message}`);
      } else {
        this.logger.error('Error verifying JWT token: Unknown error');
      }
      return null;
    }
  }

  /**
   * Verify Firebase ID token
   */
  async verifyFirebaseToken(
    token: string,
  ): Promise<admin.auth.DecodedIdToken | null> {
    try {
      if (!this.firebaseApp) {
        this.logger.error('Firebase Admin SDK not initialized');
        return null;
      }

      const decodedToken = await this.firebaseApp.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error verifying Firebase token: ${error.message}`);
      } else {
        this.logger.error('Error verifying Firebase token: Unknown error');
      }
      return null;
    }
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

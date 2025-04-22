import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../../../infrastructure/auth/decorators/public.decorator';
import { BaseController } from '../../common/base.controller';
import { LoginCommand } from '../../../usecases/auth/commands/login/login.command';
import { LoginHandler } from '../../../usecases/auth/commands/login/login.handler';
import { RegisterCommand } from '../../../usecases/auth/commands/register/register.command';
import { RegisterHandler } from '../../../usecases/auth/commands/register/register.handler';
import { GetCurrentUserHandler } from '../../../usecases/auth/queries/get_current_user/get_current_user.handler';
import { SelectClinicCommand } from '../../../usecases/auth/commands/select_clinic/select_clinic.command';
import { SelectClinicHandler } from '../../../usecases/auth/commands/select_clinic/select_clinic.handler';
import { VerifyFirebaseTokenCommand } from '../../../usecases/auth/commands/verify_firebase_token/verify_firebase_token.command';
import { VerifyFirebaseTokenHandler } from '../../../usecases/auth/commands/verify_firebase_token/verify_firebase_token.handler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController extends BaseController {
  constructor(
    private readonly loginHandler: LoginHandler,
    private readonly registerHandler: RegisterHandler,
    private readonly getCurrentUserHandler: GetCurrentUserHandler,
    private readonly selectClinicHandler: SelectClinicHandler,
    private readonly verifyFirebaseTokenHandler: VerifyFirebaseTokenHandler,
  ) {
    super(AuthController.name);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(@Body() command: LoginCommand) {
    const result = await this.loginHandler.execute(command);
    return this.success(result, 'Login successful');
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registration successful',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
  })
  async register(@Body() command: RegisterCommand) {
    const result = await this.registerHandler.execute(command);
    return this.success(result, 'Registration successful');
  }

  @Public()
  @Post('firebase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Firebase token authentication' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Authentication successful',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid token',
  })
  async firebaseAuth(@Body() command: VerifyFirebaseTokenCommand) {
    const result = await this.verifyFirebaseTokenHandler.execute(command);
    return this.success(result, 'Firebase authentication successful');
  }

  @Get('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getCurrentUser(@Req() request) {
    const result = await this.getCurrentUserHandler.execute({
      userId: request.user.id,
    });
    return this.success(result, 'User retrieved successfully');
  }

  @Post('select-clinic')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Select active clinic' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Clinic selected successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to this clinic',
  })
  async selectClinic(@Body() command: SelectClinicCommand, @Req() request) {
    const result = await this.selectClinicHandler.execute({
      ...command,
      userId: request.user.id,
    });
    return this.success(result, 'Clinic selected successfully');
  }
}

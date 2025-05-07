import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  PatientRegisterDto,
  VerifyPatientTokenDto,
} from './dto/patient_auth.dto';
import { RegisterPatientHandler } from 'src/usecases//patients/commands/register_patient/register_patient.handler';
import { RegisterPatientCommand } from 'src/usecases//patients/commands/register_patient/register_patient.command';
import { VerifyPatientTokenHandler } from 'src/usecases//patients/commands/verify_patient_token/verify_patient_token.handler';
import { VerifyPatientTokenCommand } from 'src/usecases//patients/commands/verify_patient_token/verify_patient_token.command';
import { GetPatientProfileHandler } from 'src/usecases//patients/queries/get_patient_profile/get_patient_profile.handler';
import { GetPatientProfileQuery } from 'src/usecases//patients/queries/get_patient_profile/get_patient_profile.query';
import { PatientFirebaseAuthGuard } from 'src/infrastructure/auth/guards/patient_firebase_auth.guard';

/**
 * Interface for patient authenticated request
 */
interface PatientAuthenticatedRequest extends Request {
  patient: {
    id: string;
    // 其他可能的患者屬性
  };
}

@ApiTags('patient-auth')
@Controller('api/v1/patient/auth')
export class PatientAuthController {
  constructor(
    private readonly registerPatientHandler: RegisterPatientHandler,
    private readonly verifyPatientTokenHandler: VerifyPatientTokenHandler,
    private readonly getPatientProfileHandler: GetPatientProfileHandler,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new patient' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Patient registered successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Patient already exists',
  })
  async register(@Body() dto: PatientRegisterDto) {
    const command = new RegisterPatientCommand(
      dto.idToken,
      dto.name,
      dto.phone,
      dto.nationalId,
      dto.birthDate ? new Date(dto.birthDate) : undefined,
      dto.gender,
      dto.email,
      dto.address,
    );

    return await this.registerPatientHandler.execute(command);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Firebase token and generate JWT' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token verified successfully, returns JWT',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid token',
  })
  async verifyToken(@Body() dto: VerifyPatientTokenDto) {
    const command = new VerifyPatientTokenCommand(dto.idToken);
    return await this.verifyPatientTokenHandler.execute(command);
  }

  @Get('profile')
  @UseGuards(PatientFirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get patient profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient profile retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getProfile(@Req() req: PatientAuthenticatedRequest) {
    // req.patient is set by PatientFirebaseAuthGuard
    const patientId: string = req.patient.id;
    const query = new GetPatientProfileQuery(patientId);
    return await this.getPatientProfileHandler.execute(query);
  }
}

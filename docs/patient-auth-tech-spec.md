# 診所管理系統角色與患者認證完整開發指南

## 一、系統現況分析

### 1.1 目前已實作功能
- 使用者登入系統 (內部員工)
- Firebase 認證整合
- 多診所管理架構
- 基本的 API endpoints (auth、appointments)

### 1.2 缺失功能
- 角色管理 API
- 患者認證系統
- 完整的權限控制機制

## 二、角色管理系統開發

### 2.1 現有角色定義
```prisma
enum Role {
  ADMIN        // System administrator
  CLINIC_ADMIN // Clinic administrator
  DOCTOR       // Doctor
  NURSE        // Nurse
  STAFF        // General staff
  RECEPTIONIST // Front desk receptionist
}
```

### 2.2 需要實作的角色管理 API

#### 2.2.1 API Endpoints
```typescript
// 角色管理 APIs
POST   /api/v1/clinics/{clinicId}/users                     // 添加使用者到診所
GET    /api/v1/clinics/{clinicId}/users                     // 查看診所所有使用者
PUT    /api/v1/clinics/{clinicId}/users/{userId}/role       // 更新使用者角色
DELETE /api/v1/clinics/{clinicId}/users/{userId}            // 從診所移除使用者

// 使用者診所關聯 APIs
GET    /api/v1/users/me/clinics                             // 查看我的所有診所和角色
GET    /api/v1/users/{userId}/clinics                       // 查看特定使用者的診所

// 角色定義 API
GET    /api/v1/roles                                        // 獲取所有角色定義
```

#### 2.2.2 實作步驟

**步驟 1: 建立 Use Cases**

```typescript
// src/usecases/user-clinics/commands/add-user-to-clinic.command.ts
export class AddUserToClinicCommand {
  constructor(
    public readonly clinicId: string,
    public readonly userId: string,
    public readonly role: Role,
  ) {}
}

// src/usecases/user-clinics/handlers/add-user-to-clinic.handler.ts
@CommandHandler(AddUserToClinicCommand)
export class AddUserToClinicHandler {
  constructor(
    @Inject('IUserRepository') private userRepository: IUserRepository,
    @Inject('IClinicRepository') private clinicRepository: IClinicRepository,
  ) {}

  async execute(command: AddUserToClinicCommand) {
    // 1. Verify clinic exists
    const clinic = await this.clinicRepository.findById(command.clinicId);
    if (!clinic) throw new ClinicNotFoundException();

    // 2. Verify user exists
    const user = await this.userRepository.findById(command.userId);
    if (!user) throw new UserNotFoundException();

    // 3. Add user to clinic
    const userClinic = new UserClinic({
      userId: command.userId,
      clinicId: command.clinicId,
      role: command.role,
    });

    return await this.userRepository.addToClinic(userClinic);
  }
}
```

**步驟 2: 建立 Controller**

```typescript
// src/presentation/rest/clinic-users/clinic-users.controller.ts
@Controller('clinics/:clinicId/users')
@ApiTags('clinic-users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClinicUsersController {
  constructor(
    private readonly addUserToClinicHandler: AddUserToClinicHandler,
    private readonly updateUserRoleHandler: UpdateUserRoleHandler,
    private readonly removeUserFromClinicHandler: RemoveUserFromClinicHandler,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.CLINIC_ADMIN)
  async addUserToClinic(
    @Param('clinicId') clinicId: string,
    @Body() dto: AddUserToClinicDto,
    @CurrentUser() currentUser: User,
  ) {
    // Check if user has permission for this clinic
    await this.checkClinicPermission(currentUser, clinicId);
    
    const command = new AddUserToClinicCommand(
      clinicId,
      dto.userId,
      dto.role,
    );
    
    return await this.addUserToClinicHandler.execute(command);
  }
}
```

**步驟 3: 實作權限控制**

```typescript
// src/infrastructure/auth/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    const clinicId = user.selectedClinicId;
    
    // Find user's role in the selected clinic
    const userClinic = user.clinics?.find(c => c.clinicId === clinicId);
    
    if (!userClinic) {
      return false;
    }
    
    return requiredRoles.includes(userClinic.role);
  }
}
```

## 三、患者認證系統開發

### 3.1 架構設計決策

採用 **Firebase Authentication** 作為患者認證方式，原因：
1. 支援多種登入方式（手機、Email、社群登入）
2. 處理複雜的認證邏輯
3. 提供安全的 token 管理
4. 支援 OTP 驗證

### 3.2 資料庫修改

**步驟 1: 更新 Patient Model**

```prisma
model Patient {
  id                String    @id @default(cuid())
  clinicId          String
  // Firebase authentication fields
  firebaseUid       String?   @unique  // Firebase UID
  firebaseIdToken   String?   // 最近的 ID Token (optional)
  // Existing fields
  nationalId        String?
  name              String
  birthDate         DateTime?
  gender            Gender?
  phone             String
  email             String?
  address           String?
  emergencyContact  String?
  emergencyPhone    String?
  medicalHistory    Json?
  note              String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  clinic       Clinic        @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  appointments Appointment[]

  @@unique([clinicId, nationalId])
  @@index([clinicId, phone])
  @@index([clinicId, name])
  @@index([firebaseUid])
}
```

### 3.3 後端實作

**步驟 1: Firebase Admin 設定**

```typescript
// src/infrastructure/firebase/firebase-admin.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminConfig {
  constructor(private configService: ConfigService) {
    const firebaseConfig = {
      projectId: this.configService.get('FIREBASE_PROJECT_ID'),
      privateKey: this.configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
      });
    }
  }

  getAuth() {
    return admin.auth();
  }
}
```

**步驟 2: 患者認證服務**

```typescript
// src/infrastructure/auth/services/patient-firebase-auth.service.ts
@Injectable()
export class PatientFirebaseAuthService {
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
    private readonly firebaseAdmin: auth.Auth,
  ) {}

  async authenticatePatient(idToken: string): Promise<Patient> {
    try {
      // 1. Verify Firebase token
      const decodedToken = await this.firebaseAdmin.verifyIdToken(idToken);
      const { uid, email, phone_number } = decodedToken;

      // 2. Find patient by Firebase UID
      let patient = await this.patientRepository.findByFirebaseUid(uid);

      if (!patient) {
        throw new UnauthorizedException('Patient not registered');
      }

      return patient;
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async registerPatient(
    idToken: string,
    patientData: {
      name: string;
      phone: string;
      clinicId: string;
      birthDate?: Date;
      gender?: 'MALE' | 'FEMALE' | 'OTHER';
    },
  ): Promise<Patient> {
    const decodedToken = await this.firebaseAdmin.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    const patient = new Patient({
      ...patientData,
      firebaseUid: uid,
      email: email || patientData.email,
    });

    return await this.patientRepository.create(patient);
  }
}
```

**步驟 3: 患者認證 Guard**

```typescript
// src/infrastructure/auth/guards/patient-firebase-auth.guard.ts
@Injectable()
export class PatientFirebaseAuthGuard implements CanActivate {
  constructor(private readonly patientFirebaseAuthService: PatientFirebaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const idToken = authHeader.split(' ')[1];
    const patient = await this.patientFirebaseAuthService.authenticatePatient(idToken);
    request.patient = patient;
    return true;
  }
}
```

**步驟 4: 患者API Controllers**

```typescript
// src/presentation/rest/patient-auth/patient-auth.controller.ts
@ApiTags('patient-auth')
@Controller('patient/auth')
export class PatientAuthController {
  @Post('register')
  async register(@Body() registerDto: PatientRegisterDto) {
    const { idToken, ...patientData } = registerDto;
    return await this.patientFirebaseAuthService.registerPatient(idToken, patientData);
  }

  @Get('profile')
  @UseGuards(PatientFirebaseAuthGuard)
  async getProfile(@Req() req) {
    return req.patient;
  }
}

// src/presentation/rest/patient/patient-appointments.controller.ts
@ApiTags('patient-appointments')
@Controller('patient/appointments')
@UseGuards(PatientFirebaseAuthGuard)
export class PatientAppointmentsController {
  @Get()
  async getMyAppointments(@Req() req) {
    return this.appointmentService.getPatientAppointments(req.patient.id);
  }

  @Post()
  async createAppointment(@Req() req, @Body() dto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment({
      ...dto,
      patientId: req.patient.id,
      source: 'ONLINE',
    });
  }
}
```

### 3.4 患者 API 清單

```typescript
// 患者認證 APIs
POST   /api/v1/patient/auth/register     // 患者註冊
POST   /api/v1/patient/auth/verify       // 驗證 Firebase token
GET    /api/v1/patient/auth/profile      // 取得患者資料

// 患者功能 APIs
GET    /api/v1/patient/appointments      // 查看我的預約
POST   /api/v1/patient/appointments      // 建立新預約
GET    /api/v1/patient/appointments/:id  // 查看預約詳情
PUT    /api/v1/patient/appointments/:id  // 更新預約
DELETE /api/v1/patient/appointments/:id  // 取消預約
GET    /api/v1/patient/medical-records   // 查看病歷 (未來功能)
```

## 四、實作優先順序建議

### Phase 1: 基礎建設
1. 設定 Firebase Admin SDK
2. 更新 Prisma schema
3. 執行資料庫遷移

### Phase 2: 角色管理系統
1. 實作角色管理 Use Cases
2. 建立角色管理 API Controllers
3. 實作 RolesGuard
4. 測試角色權限控制

### Phase 3: 患者認證系統
1. 實作患者認證服務
2. 建立患者認證 Guard
3. 實作患者 API Controllers
4. 整合前端 Firebase Auth

### Phase 4: 整合測試
1. 角色管理功能測試
2. 患者認證流程測試
3. 權限控制測試
4. 跨系統整合測試

## 五、安全性考量

1. **認證安全**
   - Firebase ID Token 驗證
   - JWT Token 加密
   - Token 有效期管理

2. **授權控制**
   - 基於角色的存取控制 (RBAC)
   - 診所級別的資料隔離
   - API 端點權限檢查

3. **資料保護**
   - 患者資料加密
   - 敏感資訊隱藏
   - 活動日誌追蹤

## 六、前端整合指南

### 6.1 Firebase 設定
```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 6.2 患者認證流程
```typescript
// 手機號碼登入
const signInWithPhone = async (phoneNumber: string) => {
  const appVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  return confirmationResult;
};

// OTP 驗證
const verifyOTP = async (confirmationResult, otp: string) => {
  const result = await confirmationResult.confirm(otp);
  const idToken = await result.user.getIdToken();
  return idToken;
};

// 患者註冊/登入
const patientAuth = async (idToken: string) => {
  const response = await fetch('/api/v1/patient/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  return response.json();
};
```

## 七、測試策略

1. **單元測試**
   - Use Cases 測試
   - Service 層測試
   - Guard 測試

2. **整合測試**
   - API 端點測試
   - 資料庫操作測試
   - Firebase 整合測試

3. **E2E 測試**
   - 完整的使用者流程
   - 患者認證流程
   - 角色權限測試

## 八、監控與維護

1. **日誌記錄**
   - 認證事件
   - 角色變更
   - API 存取記錄

2. **效能監控**
   - API 回應時間
   - 資料庫查詢效能
   - Firebase 請求監控

3. **安全性審計**
   - 定期權限檢查
   - 異常登入偵測
   - 資料存取審計
# 診所管理系統角色與患者認證完整開發指南（多診所架構）

## 一、系統現況分析

### 1.1 目前已實作功能
- 使用者登入系統 (內部員工)
- Firebase 認證整合
- 多診所管理架構
- 基本的 API endpoints (auth、appointments)

### 1.2 缺失功能
- 角色管理 API
- 患者認證系統（支援多診所）
- 完整的權限控制機制

### 1.3 架構問題
- 目前患者模型限制一個患者只能屬於一個診所
- 需要支援患者可以在多個診所就診的情境

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

## 三、多診所患者認證系統開發

### 3.1 架構設計決策

1. **患者資料全域化**：患者基本資料在系統中唯一存在
2. **診所特定資料隔離**：每個診所維護自己的病歷號碼和醫療記錄
3. **Firebase 統一認證**：患者使用同一個 Firebase 帳號存取所有診所

### 3.2 資料庫修改

**步驟 1: 修改 Patient Model（移除 clinicId）**

```prisma
// 修改 Patient 模型 - 移除 clinicId，變成全域患者
model Patient {
  id                String    @id @default(cuid())
  firebaseUid       String?   @unique
  nationalId        String?   @unique  // 身分證字號（全國唯一）
  name              String
  birthDate         DateTime?
  gender            Gender?
  phone             String
  email             String?
  address           String?
  emergencyContact  String?
  emergencyPhone    String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  clinicPatients    PatientClinic[]  // 與診所的關聯
  appointments      Appointment[]
  
  @@index([firebaseUid])
  @@index([nationalId])
  @@index([phone])
  @@index([name])
}
```

**步驟 2: 建立 PatientClinic 關聯表**

```prisma
// 新增患者-診所關聯表
model PatientClinic {
  patientId         String
  clinicId          String
  patientNumber     String?   // 診所內的病歷號碼
  medicalHistory    Json?     // 在此診所的病史
  note              String?   // 診所特定備註
  firstVisitDate    DateTime  @default(now())
  lastVisitDate     DateTime  @default(now())
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  patient           Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  clinic            Clinic    @relation(fields: [clinicId], references: [id], onDelete: Cascade)

  @@id([patientId, clinicId])
  @@unique([clinicId, patientNumber])  // 病歷號碼在診所內唯一
  @@index([clinicId, isActive])
}
```

**步驟 3: 更新相關模型**

```prisma
// 修改 Clinic 模型
model Clinic {
  id        String   @id @default(cuid())
  // ... existing fields ...
  
  // Relations
  users          UserClinic[]
  patientClinics PatientClinic[]  // Changed from patients
  departments    Department[]
  rooms          Room[]
  doctors        Doctor[]
  appointments   Appointment[]
  activityLogs   ActivityLog[]
}

// Appointment 模型保持不變（已經正確引用 Patient.id）
model Appointment {
  id                String            @id @default(cuid())
  clinicId          String
  patientId         String            // 關聯到全域患者
  // ... other fields ...
  
  // Relations
  clinic            Clinic    @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  patient           Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  // ... other relations ...
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

**步驟 2: 患者認證服務（支援多診所）**

```typescript
// src/infrastructure/auth/services/patient-firebase-auth.service.ts
@Injectable()
export class PatientFirebaseAuthService {
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
    @Inject('IPatientClinicRepository')
    private readonly patientClinicRepository: IPatientClinicRepository,
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
      nationalId?: string;
      birthDate?: Date;
      gender?: 'MALE' | 'FEMALE' | 'OTHER';
    },
  ): Promise<Patient> {
    const decodedToken = await this.firebaseAdmin.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    // Check if patient already exists
    const existingPatient = await this.patientRepository.findByFirebaseUid(uid);
    if (existingPatient) {
      throw new ConflictException('Patient already registered');
    }

    const patient = new Patient({
      ...patientData,
      firebaseUid: uid,
      email: email || undefined,
    });

    return await this.patientRepository.create(patient);
  }

  async linkPatientToClinic(
    patientId: string,
    clinicId: string,
    patientNumber?: string,
  ): Promise<PatientClinic> {
    // Check if link already exists
    const existingLink = await this.patientClinicRepository.findByPatientAndClinic(
      patientId,
      clinicId,
    );

    if (existingLink) {
      return existingLink;
    }

    // Create new link
    const patientClinic = new PatientClinic({
      patientId,
      clinicId,
      patientNumber,
      isActive: true,
    });

    return await this.patientClinicRepository.create(patientClinic);
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

**步驟 4: 患者API Controllers（支援多診所）**

```typescript
// src/presentation/rest/patient-auth/patient-auth.controller.ts
@ApiTags('patient-auth')
@Controller('patient/auth')
export class PatientAuthController {
  constructor(
    private readonly patientFirebaseAuthService: PatientFirebaseAuthService,
  ) {}

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

// src/presentation/rest/patient/patient-clinics.controller.ts
@ApiTags('patient-clinics')
@Controller('patient/clinics')
@UseGuards(PatientFirebaseAuthGuard)
export class PatientClinicsController {
  constructor(
    private readonly patientClinicService: PatientClinicService,
  ) {}

  @Get()
  async getMyClinics(@Req() req) {
    return this.patientClinicService.getPatientClinics(req.patient.id);
  }

  @Post(':clinicId/link')
  async linkToClinic(
    @Req() req,
    @Param('clinicId') clinicId: string,
    @Body() dto: LinkToClinicDto,
  ) {
    return this.patientClinicService.linkPatientToClinic(
      req.patient.id,
      clinicId,
      dto.patientNumber,
    );
  }
}

// src/presentation/rest/patient/patient-appointments.controller.ts
@ApiTags('patient-appointments')
@Controller('patient/appointments')
@UseGuards(PatientFirebaseAuthGuard)
export class PatientAppointmentsController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly patientClinicService: PatientClinicService,
  ) {}

  @Get()
  async getMyAppointments(
    @Req() req,
    @Query('clinicId') clinicId?: string,
  ) {
    if (clinicId) {
      // Verify patient has access to this clinic
      await this.patientClinicService.verifyPatientClinicAccess(req.patient.id, clinicId);
      return this.appointmentService.getPatientAppointmentsByClinic(
        req.patient.id,
        clinicId,
      );
    }
    return this.appointmentService.getAllPatientAppointments(req.patient.id);
  }

  @Post()
  async createAppointment(@Req() req, @Body() dto: CreatePatientAppointmentDto) {
    // Ensure patient is linked to the clinic
    await this.patientClinicService.linkPatientToClinic(
      req.patient.id,
      dto.clinicId,
    );

    return this.appointmentService.createAppointment({
      ...dto,
      patientId: req.patient.id,
      source: 'ONLINE',
    });
  }
}
```

### 3.4 患者 API 清單（支援多診所）

```typescript
// 患者認證 APIs
POST   /api/v1/patient/auth/register              // 患者註冊
POST   /api/v1/patient/auth/verify                // 驗證 Firebase token
GET    /api/v1/patient/auth/profile               // 取得患者資料

// 患者診所關聯 APIs
GET    /api/v1/patient/clinics                    // 查看我去過的診所
POST   /api/v1/patient/clinics/:clinicId/link     // 建立與診所的關聯
GET    /api/v1/patient/clinics/:clinicId          // 查看在特定診所的資料

// 患者預約 APIs（需指定診所）
GET    /api/v1/patient/appointments               // 查看所有預約（可選診所篩選）
POST   /api/v1/patient/appointments               // 建立新預約（需指定診所）
GET    /api/v1/patient/appointments/:id           // 查看預約詳情
PUT    /api/v1/patient/appointments/:id           // 更新預約
DELETE /api/v1/patient/appointments/:id           // 取消預約

// 患者病歷 APIs（診所限定）
GET    /api/v1/patient/clinics/:clinicId/medical-records  // 查看在特定診所的病歷
```

### 3.5 DTO 定義

```typescript
// Patient registration (no clinic required)
interface PatientRegisterDto {
  idToken: string;
  name: string;
  phone: string;
  nationalId?: string;
  birthDate?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  address?: string;
}

// Link patient to clinic
interface LinkToClinicDto {
  patientNumber?: string;  // Optional clinic-specific patient number
}

// Create appointment (must specify clinic)
interface CreatePatientAppointmentDto {
  clinicId: string;        // Required
  doctorId?: string;
  departmentId?: string;
  appointmentTime?: Date;
  note?: string;
}

// Patient clinic info response
interface PatientClinicInfoDto {
  clinicId: string;
  clinicName: string;
  patientNumber?: string;
  firstVisitDate: Date;
  lastVisitDate: Date;
  totalVisits: number;
  isActive: boolean;
}
```

## 四、實作優先順序建議

### Phase 1: 資料庫結構調整
1. 更新 Prisma schema（支援多診所患者）
2. 建立資料遷移腳本
3. 執行資料庫遷移

### Phase 2: 基礎建設
1. 設定 Firebase Admin SDK
2. 建立 Repository interfaces
3. 實作 PatientClinic repository

### Phase 3: 角色管理系統
1. 實作角色管理 Use Cases
2. 建立角色管理 API Controllers
3. 實作 RolesGuard
4. 測試角色權限控制

### Phase 4: 患者認證系統
1. 實作患者認證服務（支援多診所）
2. 建立患者認證 Guard
3. 實作患者-診所關聯服務
4. 建立患者 API Controllers

### Phase 5: 整合測試
1. 角色管理功能測試
2. 患者認證流程測試
3. 多診所患者管理測試
4. 權限控制測試

## 五、安全性考量

1. **認證安全**
   - Firebase ID Token 驗證
   - JWT Token 加密
   - Token 有效期管理

2. **授權控制**
   - 基於角色的存取控制 (RBAC)
   - 診所級別的資料隔離
   - 患者-診所關聯驗證

3. **資料保護**
   - 患者資料加密
   - 醫療記錄隔離（診所間不可存取）
   - 敏感資訊隱藏

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

### 6.2 患者認證流程（支援多診所）
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

// 患者註冊（不需要指定診所）
const registerPatient = async (idToken: string, patientData: any) => {
  const response = await fetch('/api/v1/patient/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, ...patientData }),
  });
  return response.json();
};

// 取得患者的診所列表
const getPatientClinics = async (token: string) => {
  const response = await fetch('/api/v1/patient/clinics', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
};

// 建立預約（需指定診所）
const createAppointment = async (token: string, appointmentData: any) => {
  const response = await fetch('/api/v1/patient/appointments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData),
  });
  return response.json();
};
```

### 6.3 Flutter App 使用流程

1. **首次註冊**
   - 使用 Firebase 手機驗證
   - 填寫基本資料（姓名、生日等）
   - 不需要選擇診所

2. **選擇診所**
   - App 顯示附近的診所列表
   - 患者選擇要預約的診所
   - 如果是首次到該診所，自動建立關聯

3. **預約掛號**
   - 選擇診所 → 選擇科別 → 選擇醫生 → 選擇時間
   - 系統自動處理患者與診所的關聯

4. **就診記錄**
   - 可以查看在所有診所的就診記錄
   - 可以按診所分類檢視

## 七、資料遷移計畫

### 7.1 現有資料遷移步驟
1. 備份現有資料庫
2. 建立新的 PatientClinic 表
3. 移轉現有患者資料：
   ```sql
   -- Create PatientClinic records from existing Patient data
   INSERT INTO PatientClinic (patientId, clinicId, patientNumber, isActive, firstVisitDate, lastVisitDate)
   SELECT id, clinicId, patientNumber, true, createdAt, updatedAt
   FROM Patient;
   ```
4. 修改 Patient 表結構（移除 clinicId）
5. 更新相關的 API 和業務邏輯
6. 測試確保所有功能正常

### 7.2 相容性考量
- 確保新舊 API 在過渡期間都能正常運作
- 提供資料移轉腳本給已部署的診所
- 監控遷移過程，確保資料完整性

## 八、測試策略

1. **單元測試**
   - 測試多診所患者管理邏輯
   - 測試患者-診所關聯服務
   - 測試權限控制邏輯

2. **整合測試**
   - 測試完整的患者註冊流程
   - 測試跨診所預約功能
   - 測試資料隔離機制

3. **E2E 測試**
   - 模擬患者在多個診所就診的流程
   - 測試診所端查看患者資料的權限
   - 測試患者端查看多診所記錄

## 九、監控與維護

1. **日誌記錄**
   - 記錄患者-診所關聯建立
   - 記錄跨診所存取嘗試
   - 記錄認證失敗事件

2. **效能監控**
   - 監控多診所查詢效能
   - 監控 Firebase 認證延遲
   - 監控資料庫查詢效能

3. **安全性審計**
   - 定期審查跨診所存取記錄
   - 監控異常登入模式
   - 追蹤敏感資料存取
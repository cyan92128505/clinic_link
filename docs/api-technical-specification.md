# 診所管理系統 API 技術規格文件（完整版）

## 一、已實作的 API

### 1.1 應用程式基礎 API
```
App
  GET /
    描述: Welcome message
    回應: 200 - Welcome information
```

### 1.2 身分驗證 API
```
Authentication
  POST /api/v1/auth/login
    描述: User login
    請求內容: 
      {
        "email": "user@example.com",     // 必填
        "password": "password123"        // 必填
      }
    回應:
      200 - Login successful
      401 - Invalid credentials

  POST /api/v1/auth/register
    描述: User registration
    請求內容:
      {
        "email": "user@example.com",           // 必填
        "password": "password123",             // 必填
        "name": "John Doe",                    // 必填
        "phone": "0912345678",                 // 選填
        "clinicName": "My Clinic",             // 選填
        "clinicAddress": "No. 123, Example St", // 若有clinicName則必填
        "clinicPhone": "0223456789"            // 若有clinicName則必填
      }
    回應:
      201 - Registration successful
      409 - User already exists

  POST /api/v1/auth/firebase
    描述: Firebase token authentication
    請求內容:
      {
        "token": "eyJhbGciOiJS..."  // Firebase ID token, 必填
      }
    回應:
      200 - Authentication successful
      401 - Invalid token

  GET /api/v1/auth/user
    描述: Get current user
    授權: Bearer Token
    回應:
      200 - User retrieved successfully
      401 - Unauthorized

  POST /api/v1/auth/select-clinic
    描述: Select active clinic
    授權: Bearer Token
    請求內容:
      {
        "clinicId": "cl9ebqhxk0000dsr3xxxx1c1s"  // 必填
      }
    回應:
      200 - Clinic selected successfully  
      403 - User does not have access to this clinic
```

### 1.3 健康檢查 API
```
Health
  GET /health
    描述: Check system health
    回應:
      200 - The Health Check is successful
        {
          "status": "ok",
          "info": { "database": {"status": "up"} },
          "error": {},
          "details": { "database": {"status": "up"} }
        }
      503 - The Health Check is not successful
        {
          "status": "error",
          "info": { "database": {"status": "up"} },
          "error": { "redis": {"status": "down", "message": "Could not connect"} },
          "details": {
            "database": {"status": "up"},
            "redis": {"status": "down", "message": "Could not connect"}
          }
        }
```

### 1.4 預約管理 API
```
Appointments
  GET /api/v1/appointments
    描述: Get appointments with filters
    授權: Bearer Token
    查詢參數:
      - date: string (YYYY-MM-DD) - Filter by date
      - status: string - Filter by status [SCHEDULED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
      - startDate: datetime - Filter by date range start
      - endDate: datetime - Filter by date range end  
      - doctorId: string - Filter by doctor ID
      - patientId: string - Filter by patient ID
    回應:
      200 - Returns a list of appointments filtered by query parameters

  POST /api/v1/appointments
    描述: Create a new appointment
    授權: Bearer Token
    請求內容:
      {
        "patientId": "123e4567-e89b-12d3-a456-426614174000",  // 必填
        "doctorId": "123e4567-e89b-12d3-a456-426614174001",   // 選填
        "departmentId": "123e4567-e89b-12d3-a456-426614174002", // 選填
        "appointmentTime": "2023-12-31T14:30:00+08:00",       // 選填
        "source": "WALK_IN",  // 必填 [WALK_IN, PHONE, ONLINE, LINE, APP]
        "note": "Patient requested afternoon appointment"      // 選填
      }
    回應:
      201 - Creates a new appointment

  PUT /api/v1/appointments/{id}
    描述: Update appointment status or details
    授權: Bearer Token
    路徑參數:
      - id: string - Appointment ID
    請求內容:
      {
        "status": "CHECKED_IN",  // 選填 [SCHEDULED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
        "doctorId": "123e4567-e89b-12d3-a456-426614174001",   // 選填
        "roomId": "123e4567-e89b-12d3-a456-426614174003",     // 選填
        "appointmentTime": "2023-12-31T14:30:00+08:00",       // 選填
        "checkinTime": "2023-12-31T14:25:00+08:00",          // 選填
        "startTime": "2023-12-31T14:35:00+08:00",            // 選填
        "endTime": "2023-12-31T14:50:00+08:00",              // 選填
        "note": "Patient will be late"                        // 選填
      }
    回應:
      200 - Updates an existing appointment
```

## 二、需要實作的 API

### 2.1 角色管理 API
```
Clinic Users Management
  POST /api/v1/clinics/{clinicId}/users
    描述: Add user to clinic
    授權: Bearer Token + Role [ADMIN, CLINIC_ADMIN]
    路徑參數:
      - clinicId: string - Clinic ID
    請求內容:
      {
        "userId": string,       // 必填
        "role": string          // 必填 [ADMIN, CLINIC_ADMIN, DOCTOR, NURSE, STAFF, RECEPTIONIST]
      }
    回應:
      201 - User added to clinic successfully
      404 - Clinic or User not found
      409 - User already exists in clinic

  GET /api/v1/clinics/{clinicId}/users
    描述: Get all users in clinic
    授權: Bearer Token + Role [ADMIN, CLINIC_ADMIN]
    路徑參數:
      - clinicId: string - Clinic ID
    回應:
      200 - Returns list of users in clinic

  PUT /api/v1/clinics/{clinicId}/users/{userId}/role
    描述: Update user role in clinic
    授權: Bearer Token + Role [ADMIN, CLINIC_ADMIN]
    路徑參數:
      - clinicId: string - Clinic ID
      - userId: string - User ID
    請求內容:
      {
        "role": string  // 必填 [ADMIN, CLINIC_ADMIN, DOCTOR, NURSE, STAFF, RECEPTIONIST]
      }
    回應:
      200 - Role updated successfully
      404 - User not found in clinic

  DELETE /api/v1/clinics/{clinicId}/users/{userId}
    描述: Remove user from clinic
    授權: Bearer Token + Role [ADMIN, CLINIC_ADMIN]
    路徑參數:
      - clinicId: string - Clinic ID
      - userId: string - User ID
    回應:
      204 - User removed successfully
      404 - User not found in clinic

User Clinics
  GET /api/v1/users/me/clinics
    描述: Get current user's clinics and roles
    授權: Bearer Token
    回應:
      200 - Returns list of user's clinics with roles

  GET /api/v1/users/{userId}/clinics
    描述: Get specific user's clinics
    授權: Bearer Token + Role [ADMIN]
    路徑參數:
      - userId: string - User ID
    回應:
      200 - Returns list of user's clinics

Roles Definition
  GET /api/v1/roles
    描述: Get all available roles
    授權: Bearer Token
    回應:
      200 - Returns list of roles with descriptions
```

### 2.2 患者認證 API（支援多診所）
```
Patient Authentication
  POST /api/v1/patient/auth/register
    描述: Patient registration
    請求內容:
      {
        "idToken": string,      // Firebase ID token, 必填
        "name": string,         // 必填
        "phone": string,        // 必填
        "nationalId": string,   // 選填
        "birthDate": date,      // 選填
        "gender": string,       // 選填 [MALE, FEMALE, OTHER]
        "email": string,        // 選填
        "address": string       // 選填
      }
    回應:
      201 - Registration successful
      409 - Patient already exists

  POST /api/v1/patient/auth/verify
    描述: Verify Firebase token
    請求內容:
      {
        "idToken": string      // Firebase ID token, 必填
      }
    回應:
      200 - Token verified, returns JWT
      401 - Invalid token

  GET /api/v1/patient/auth/profile
    描述: Get patient profile
    授權: Bearer Token (Patient)
    回應:
      200 - Returns patient profile
      401 - Unauthorized

Patient Clinics Management
  GET /api/v1/patient/clinics
    描述: Get patient's linked clinics
    授權: Bearer Token (Patient)
    回應:
      200 - Returns list of linked clinics

  POST /api/v1/patient/clinics/{clinicId}/link
    描述: Link patient to clinic
    授權: Bearer Token (Patient)
    路徑參數:
      - clinicId: string - Clinic ID
    請求內容:
      {
        "patientNumber": string  // 選填, clinic-specific patient number
      }
    回應:
      201 - Link created successfully
      404 - Clinic not found

  GET /api/v1/patient/clinics/{clinicId}
    描述: Get patient's information in specific clinic
    授權: Bearer Token (Patient)
    路徑參數:
      - clinicId: string - Clinic ID
    回應:
      200 - Returns patient info in clinic
      404 - Patient not linked to clinic

Patient Appointments
  GET /api/v1/patient/appointments
    描述: Get patient's appointments
    授權: Bearer Token (Patient)
    查詢參數:
      - clinicId: string - Filter by clinic (選填)
    回應:
      200 - Returns list of appointments

  POST /api/v1/patient/appointments
    描述: Create appointment (from patient app)
    授權: Bearer Token (Patient)
    請求內容:
      {
        "clinicId": string,        // 必填
        "doctorId": string,        // 選填
        "departmentId": string,    // 選填
        "appointmentTime": datetime, // 選填
        "note": string             // 選填
      }
    回應:
      201 - Appointment created

  GET /api/v1/patient/appointments/{id}
    描述: Get appointment details
    授權: Bearer Token (Patient)
    路徑參數:
      - id: string - Appointment ID
    回應:
      200 - Returns appointment details
      404 - Appointment not found

  PUT /api/v1/patient/appointments/{id}
    描述: Update appointment
    授權: Bearer Token (Patient)
    路徑參數:
      - id: string - Appointment ID
    請求內容:
      {
        "appointmentTime": datetime,  // 選填
        "note": string               // 選填
      }
    回應:
      200 - Appointment updated
      404 - Appointment not found

  DELETE /api/v1/patient/appointments/{id}
    描述: Cancel appointment
    授權: Bearer Token (Patient)
    路徑參數:
      - id: string - Appointment ID
    回應:
      204 - Appointment cancelled
      404 - Appointment not found

Patient Medical Records
  GET /api/v1/patient/clinics/{clinicId}/medical-records
    描述: Get medical records in specific clinic
    授權: Bearer Token (Patient)
    路徑參數:
      - clinicId: string - Clinic ID
    回應:
      200 - Returns medical records
      404 - Patient not linked to clinic
```

### 2.3 診所內部管理 API
```
Patients Management (for Clinic Staff)
  GET /api/v1/patients
    描述: Get patients in current clinic
    授權: Bearer Token + Clinic Context
    查詢參數:
      - search: string - Search by name, phone, or patient number
      - page: number - Page number (default: 1)
      - limit: number - Items per page (default: 20)
    回應:
      200 - Returns paginated list of patients

  POST /api/v1/patients
    描述: Create new patient
    授權: Bearer Token + Clinic Context
    請求內容:
      {
        "name": string,              // 必填
        "phone": string,             // 必填
        "nationalId": string,        // 選填
        "birthDate": date,           // 選填
        "gender": string,            // 選填 [MALE, FEMALE, OTHER]
        "email": string,             // 選填
        "address": string,           // 選填
        "emergencyContact": string,  // 選填
        "emergencyPhone": string,    // 選填
        "note": string              // 選填
      }
    回應:
      201 - Patient created successfully

  GET /api/v1/patients/{patientId}
    描述: Get patient details
    授權: Bearer Token + Clinic Context
    路徑參數:
      - patientId: string - Patient ID
    回應:
      200 - Returns patient details
      404 - Patient not found

  PUT /api/v1/patients/{patientId}
    描述: Update patient information
    授權: Bearer Token + Clinic Context
    路徑參數:
      - patientId: string - Patient ID
    請求內容: (all fields optional)
    回應:
      200 - Patient updated successfully
      404 - Patient not found

Rooms Management
  GET /api/v1/rooms
    描述: Get all rooms with queue information
    授權: Bearer Token + Clinic Context
    回應:
      200 - Returns list of rooms with status and queue

  PUT /api/v1/rooms/{roomId}
    描述: Update room status
    授權: Bearer Token + Clinic Context
    路徑參數:
      - roomId: string - Room ID
    請求內容:
      {
        "status": string  // 必填 [OPEN, PAUSED, CLOSED]
      }
    回應:
      200 - Room status updated
      404 - Room not found

Departments Management
  GET /api/v1/departments
    描述: Get all departments
    授權: Bearer Token + Clinic Context
    回應:
      200 - Returns list of departments

Doctors Management
  GET /api/v1/doctors
    描述: Get all doctors
    授權: Bearer Token + Clinic Context
    查詢參數:
      - departmentId: string - Filter by department (選填)
    回應:
      200 - Returns list of doctors

Activity Logs
  GET /api/v1/activity-logs
    描述: Get activity logs
    授權: Bearer Token + Clinic Context + Role [ADMIN, CLINIC_ADMIN]
    查詢參數:
      - startDate: datetime - Filter start date
      - endDate: datetime - Filter end date
      - userId: string - Filter by user
      - action: string - Filter by action type
      - page: number - Page number (default: 1)
      - limit: number - Items per page (default: 50)
    回應:
      200 - Returns paginated activity logs

Statistics
  GET /api/v1/stats/dashboard
    描述: Get dashboard statistics
    授權: Bearer Token + Clinic Context
    查詢參數:
      - date: date - Statistics for specific date (default: today)
    回應:
      200 - Returns dashboard statistics
        {
          "todayAppointments": number,
          "waitingPatients": number,
          "completedAppointments": number,
          "cancelledAppointments": number,
          "noShowAppointments": number,
          "averageWaitTime": number,
          "averageConsultationTime": number
        }
```

## 三、API 規範與注意事項

### 3.1 認證與授權
- **內部使用者**：使用 JWT Token，透過 `/api/v1/auth/login` 或 `/api/v1/auth/firebase` 取得
- **患者**：使用 Firebase Authentication + JWT Token，透過 `/api/v1/patient/auth/verify` 取得
- **多診所上下文**：內部使用者需先選擇診所（`/api/v1/auth/select-clinic`）才能操作診所資料
- **角色權限**：使用 Role-Based Access Control (RBAC)，某些 API 需要特定角色才能存取

### 3.2 錯誤回應格式
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": {
    "fields": {
      "email": "Invalid email format"
    }
  }
}
```

### 3.3 分頁回應格式
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### 3.4 日期時間格式
- 所有日期時間使用 ISO 8601 格式
- 時區處理：API 接受帶時區的時間，回應也包含時區資訊

### 3.5 資料驗證
- 必填欄位在請求中必須提供
- 電子郵件需符合標準格式
- 電話號碼需符合台灣格式
- 身分證字號需通過檢核邏輯

### 3.6 安全性考量
- 所有 API 使用 HTTPS
- 敏感資訊（如密碼）不會在回應中返回
- 實作請求頻率限制（Rate Limiting）
- 跨診所資料存取需要適當權限

## 四、實作優先順序

### Phase 1：基礎架構
1. 角色管理 API
2. 患者認證 API（支援多診所）
3. 權限控制機制

### Phase 2：核心功能
1. 患者管理 API（診所端）
2. 診間管理 API
3. 科別管理 API
4. 醫生管理 API

### Phase 3：進階功能
1. 患者預約管理 API（患者端）
2. 活動日誌 API
3. 統計儀表板 API

### Phase 4：整合優化
1. MQTT 即時通知整合
2. 效能優化
3. 監控與日誌系統
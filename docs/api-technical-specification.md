# 診所管理系統 API 技術規格文件

## 已實作的 API

### 應用程式基礎 API
```
App
  GET /
    描述: Welcome message
    回應: 200 - Welcome information
```

### 身分驗證 API
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

### 健康檢查 API
```
Health
  GET /health
    描述: Check system health
    回應:
      200 - The Health Check is successful
        {
          "status": "ok",
          "info": {
            "database": {"status": "up"}
          },
          "error": {},
          "details": {
            "database": {"status": "up"}
          }
        }
      503 - The Health Check is not successful
        {
          "status": "error",
          "info": {
            "database": {"status": "up"}
          },
          "error": {
            "redis": {"status": "down", "message": "Could not connect"}
          },
          "details": {
            "database": {"status": "up"},
            "redis": {"status": "down", "message": "Could not connect"}
          }
        }
```

### 預約管理 API
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

## 需要實作的 API

### 病患管理 API
```
Patients
  GET /api/v1/patients
    描述: Get all patients or search by criteria
    授權: Bearer Token
    查詢參數:
      - patientId: string - 病歷號碼
      - name: string - 姓名
      - phone: string - 電話
    回應: 病患列表或單一病患資料

  POST /api/v1/patients
    描述: Create a new patient
    授權: Bearer Token
    請求內容:
      {
        "name": string,              // 必填
        "nationalId": string,        // 選填
        "birthDate": string,         // 選填
        "gender": string,            // 選填 [MALE, FEMALE, OTHER]
        "phone": string,             // 必填
        "email": string,             // 選填
        "address": string,           // 選填
        "emergencyContact": string,  // 選填
        "emergencyPhone": string,    // 選填
        "medicalHistory": object,    // 選填
        "note": string              // 選填
      }
    回應: 新建立的病患資料

  PUT /api/v1/patients/{patientId}
    描述: Update patient information
    授權: Bearer Token
    路徑參數:
      - patientId: string - 病歷號碼
    請求內容: 更新的病患資料 (部分更新)
    回應: 更新後的病患資料
```

### 診間管理 API
```
Rooms
  GET /api/v1/rooms
    描述: Get all rooms with queue information
    授權: Bearer Token
    回應: 診間列表，包含候診人數和當前狀態

  PUT /api/v1/rooms/{roomId}
    描述: Update room status
    授權: Bearer Token
    路徑參數:
      - roomId: string - 診間 ID
    請求內容:
      {
        "isActive": boolean  // 開診或關診狀態
      }
    回應: 更新後的診間資料
```

### 科別管理 API
```
Departments
  GET /api/v1/departments
    描述: Get all departments
    授權: Bearer Token
    回應: 科別列表
      [
        {
          "id": number,
          "name": string,
          "description": string,
          "color": string
        }
      ]
```

### 醫生管理 API
```
Doctors
  GET /api/v1/doctors
    描述: Get all doctors
    授權: Bearer Token
    回應: 醫生列表
      [
        {
          "id": number,
          "fullName": string,
          "departmentId": number,
          "title": string,
          "specialty": string
        }
      ]
```

### 活動日誌 API
```
ActivityLogs
  GET /api/v1/activity-logs
    描述: Get activity logs
    授權: Bearer Token
    查詢參數:
      - limit: number - 最大回傳數量
      - offset: number - 跳過的數量
    回應: 活動日誌列表
```

### 統計數據 API
```
Statistics
  GET /api/v1/stats/dashboard
    描述: Get dashboard statistics
    授權: Bearer Token
    回應: 包含各種統計數據
      {
        "todayAppointments": number,      // 今日預約數
        "waitingPatients": number,        // 等候中病患數
        "completedAppointments": number,  // 已完成看診數
        "cancelledAppointments": number   // 取消預約數
      }
```

## API 通用規範

### 認證機制
- 系統支援兩種認證方式：
  - 傳統帳號密碼登入：使用 `/api/v1/auth/login`
  - Firebase 認證：使用 `/api/v1/auth/firebase`
- 所有需要身分驗證的 API 都需要在 Header 中加入：`Authorization: Bearer <JWT_TOKEN>`

### 多診所管理
- 使用者可以同時屬於多個診所
- 需要透過 `/api/v1/auth/select-clinic` 選擇當前活動的診所
- 選擇診所後，所有資料操作都會在該診所的上下文中執行

### 資料格式
- 所有日期時間格式使用 ISO 8601 標準
- 所有 API 皆使用 JSON 格式作為請求和回應的內容類型
- 空值處理：可選欄位若無值則不回傳，而非回傳 null

### 錯誤處理
| 狀態碼 | 說明                                              |
| ------ | ------------------------------------------------- |
| 400    | Bad Request - 請求格式錯誤                        |
| 401    | Unauthorized - 未授權                             |
| 403    | Forbidden - 無權限                                |
| 404    | Not Found - 資源不存在                            |
| 409    | Conflict - 資源衝突                               |
| 422    | Unprocessable Entity - 請求格式正確但含有邏輯錯誤 |
| 500    | Internal Server Error - 伺服器錯誤                |

### 分頁機制
- 使用 `limit` 和 `offset` 進行分頁
- 預設 `limit` 為 20，最大值為 100
- 回應包含總筆數資訊以利前端分頁

### API 版本控制
- 目前版本為 v1，所有 API 路徑都以 `/api/v1/` 開頭
- 未來若有重大變更將發布新版本，舊版本將保持向後相容

## 建議的實作優先順序

根據系統核心功能及依賴關係，建議按以下順序實作：

1. **基礎資料管理**（建立系統基本資料）
   - GET /api/v1/departments
   - GET /api/v1/doctors 
   - GET /api/v1/patients
   - POST /api/v1/patients

2. **診間管理**（支援看診流程）
   - GET /api/v1/rooms
   - PUT /api/v1/rooms/{roomId}

3. **病患資料管理**（完整病患功能）
   - PUT /api/v1/patients/{patientId}

4. **統計與紀錄**（營運分析）
   - GET /api/v1/stats/dashboard
   - GET /api/v1/activity-logs

## API 安全性考量

1. **認證與授權**
   - 所有 API 都需要經過身分驗證（除了登入和註冊）
   - 使用 JWT token 進行狀態管理
   - Token 有效期限設定為 24 小時

2. **資料隔離**
   - 所有資料操作都必須在診所上下文中進行
   - 防止跨診所資料存取
   - 使用者只能存取其有權限的診所資料

3. **輸入驗證**
   - 所有輸入資料都需要經過驗證
   - 防止 SQL injection 和 XSS 攻擊
   - 使用參數化查詢處理資料庫操作

4. **敏感資訊保護**
   - 病患個資需要加密儲存
   - API 回應中避免包含敏感資訊
   - 日誌中不記錄敏感資料
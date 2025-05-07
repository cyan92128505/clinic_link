# 診所管理整合系統 - 權限與 API 擴展技術規格文件

## 1. 概述

本文件詳細說明診所管理整合系統 (Clinic Link) 在權限管理和 API 擴展方面的技術規格。目的是完善系統的角色權限管理和診所相關操作功能，以支援多診所場景下的複雜業務需求。

## 2. 權限系統架構

### 2.1 權限模型

我們將採用基於 RBAC (Role-Based Access Control) 的權限系統，並增加資源範圍限制，形成較完整的權限管控機制。

#### 2.1.1 核心概念

- **權限 (Permission)**: 最基本的權限單元，由「資源類型」和「操作」組成
- **角色 (Role)**: 權限的集合，可賦予使用者
- **資源範圍 (Scope)**: 定義資源的訪問範圍（例如：全系統、特定診所、部門）
- **使用者角色 (UserRole)**: 使用者在特定診所中的角色

#### 2.1.2 資料模型

```prisma
// 權限資料模型
model Permission {
  id          String   @id @default(cuid())
  code        String   @unique // 例如：patients:read
  name        String
  description String?
  resource    String   // 資源類型，例如: patients
  action      String   // 操作，例如: read, write, delete
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 關聯
  roles RolePermission[]

  @@index([resource, action])
}

// 角色資料模型 (擴展原有的 Role 枚舉)
model SystemRole {
  id          String   @id @default(cuid())
  code        String   @unique // 系統層級角色代碼，例如: SUPER_ADMIN
  name        String
  description String?
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 關聯
  permissions RolePermission[]
  userRoles   UserRole[]

  // 索引
  @@index([code])
}

// 角色-權限關聯表
model RolePermission {
  roleId       String
  permissionId String
  createdAt    DateTime @default(now())

  // 關聯
  role       SystemRole @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

// 使用者角色 (替代原有的 UserClinic)
model UserRole {
  userId      String
  clinicId    String
  systemRoleId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 關聯
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  clinic     Clinic     @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  systemRole SystemRole @relation(fields: [systemRoleId], references: [id])

  @@id([userId, clinicId])
  @@index([userId, systemRoleId])
}
```

### 2.2 預設角色與權限

系統將內建以下預設角色和相應權限：

| 角色代碼     | 角色名稱       | 描述                                     | 權限範圍 |
| ------------ | -------------- | ---------------------------------------- | -------- |
| SUPER_ADMIN  | 系統超級管理員 | 擁有系統所有權限，可管理所有診所         | 全系統   |
| CLINIC_ADMIN | 診所管理員     | 可管理單一診所的所有資源                 | 單一診所 |
| DOCTOR       | 醫師           | 醫師相關權限，如看診、查看病患資料等     | 單一診所 |
| NURSE        | 護士           | 護理相關權限，如預約管理、病患資料管理等 | 單一診所 |
| RECEPTIONIST | 前台接待       | 前台相關權限，如掛號、報到等             | 單一診所 |
| STAFF        | 一般工作人員   | 基本權限，如查看排班等                   | 單一診所 |

### 2.3 權限編碼規則

權限代碼採用 `resource:action` 格式，例如：

- `patients:read` - 讀取病患資料
- `appointments:create` - 建立預約
- `clinics:manage` - 管理診所資訊

### 2.4 授權流程

1. 使用者登入系統獲取 JWT Token
2. Token 包含使用者 ID 和已選擇的診所 ID
3. 每次 API 請求會檢查：
   - 使用者是否已認證
   - 使用者在目前診所的角色
   - 該角色是否具有請求 API 所需的權限

## 3. API 擴展規格

### 3.1 權限管理 API

#### 3.1.1 權限列表 API

```
GET /api/v1/permissions
```

**權限要求**: `permissions:read`  
**描述**: 獲取系統所有權限列表  
**查詢參數**:
- `resource` (選填): 依資源類型過濾
- `page` (選填): 頁碼，預設為 1
- `limit` (選填): 每頁數量，預設為 50

**響應**:
```json
{
  "data": [
    {
      "id": "clk3d5x1a0001xys7dfgh1234",
      "code": "patients:read",
      "name": "讀取病患資訊",
      "description": "允許讀取病患基本資訊",
      "resource": "patients",
      "action": "read",
      "createdAt": "2023-05-01T00:00:00Z",
      "updatedAt": "2023-05-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

#### 3.1.2 角色管理 API

**獲取所有角色**
```
GET /api/v1/roles
```

**權限要求**: `roles:read`  
**描述**: 獲取系統所有角色列表  
**查詢參數**:
- `page` (選填): 頁碼，預設為 1
- `limit` (選填): 每頁數量，預設為 20

**創建新角色**
```
POST /api/v1/roles
```

**權限要求**: `roles:create`  
**描述**: 創建新的角色  
**請求體**:
```json
{
  "code": "HEAD_NURSE",
  "name": "護理長",
  "description": "負責管理護理人員",
  "isDefault": false,
  "permissions": ["patients:read", "patients:update", "staff:manage"]
}
```

**獲取角色詳情**
```
GET /api/v1/roles/{roleId}
```

**權限要求**: `roles:read`  
**描述**: 獲取特定角色詳情，包括其權限列表

**更新角色**
```
PUT /api/v1/roles/{roleId}
```

**權限要求**: `roles:update`  
**描述**: 更新角色資訊  
**請求體**:
```json
{
  "name": "資深護理長",
  "description": "負責管理護理人員和培訓",
  "isDefault": false
}
```

**刪除角色**
```
DELETE /api/v1/roles/{roleId}
```

**權限要求**: `roles:delete`  
**描述**: 刪除角色（只能刪除非預設角色）

**更新角色權限**
```
PUT /api/v1/roles/{roleId}/permissions
```

**權限要求**: `roles:manage_permissions`  
**描述**: 更新角色的權限清單  
**請求體**:
```json
{
  "permissions": ["patients:read", "patients:update", "appointments:create"]
}
```

#### 3.1.3 使用者權限 API

**檢查使用者權限**
```
GET /api/v1/auth/check-permission?permission=patients:read
```

**權限要求**: 已認證的使用者  
**描述**: 檢查目前使用者是否具有特定權限  
**查詢參數**:
- `permission` (必填): 要檢查的權限代碼

**響應**:
```json
{
  "hasPermission": true
}
```

**獲取使用者角色及權限**
```
GET /api/v1/users/{userId}/roles
```

**權限要求**: `users:read` 或 `users:manage`  
**描述**: 獲取使用者在各診所的角色  
**查詢參數**:
- `clinicId` (選填): 限定查詢特定診所的角色

### 3.2 診所管理 API

#### 3.2.1 診所 CRUD API

**獲取診所列表**
```
GET /api/v1/clinics
```

**權限要求**: `clinics:read`  
**描述**: 獲取系統中的診所列表（根據使用者權限過濾）  
**查詢參數**:
- `search` (選填): 搜尋診所名稱或地址
- `page` (選填): 頁碼，預設為 1
- `limit` (選填): 每頁數量，預設為 20

**響應**:
```json
{
  "data": [
    {
      "id": "clk3d5x1a0001xys7abcd1234",
      "name": "康健診所",
      "address": "台北市信義區松仁路100號",
      "phone": "0223456789",
      "email": "info@example.com",
      "logo": "https://cdn.example.com/logos/clinic1.png",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**創建新診所**
```
POST /api/v1/clinics
```

**權限要求**: `clinics:create`  
**描述**: 創建新的診所  
**請求體**:
```json
{
  "name": "新康健診所",
  "address": "台北市信義區松仁路200號",
  "phone": "0223456780",
  "email": "newclinic@example.com",
  "logo": "base64encoded_image_data",
  "settings": {
    "workingHours": {
      "monday": {"start": "09:00", "end": "18:00", "isOpen": true},
      "tuesday": {"start": "09:00", "end": "18:00", "isOpen": true},
      "wednesday": {"start": "09:00", "end": "18:00", "isOpen": true},
      "thursday": {"start": "09:00", "end": "18:00", "isOpen": true},
      "friday": {"start": "09:00", "end": "18:00", "isOpen": true},
      "saturday": {"start": "09:00", "end": "13:00", "isOpen": true},
      "sunday": {"isOpen": false}
    }
  }
}
```

**獲取診所詳情**
```
GET /api/v1/clinics/{clinicId}
```

**權限要求**: `clinics:read`  
**描述**: 獲取診所詳細資訊

**更新診所資訊**
```
PUT /api/v1/clinics/{clinicId}
```

**權限要求**: `clinics:update`  
**描述**: 更新診所基本資訊  
**請求體**:
```json
{
  "name": "康健聯合診所",
  "address": "台北市信義區松仁路100號2樓",
  "phone": "0223456789",
  "email": "updated@example.com",
  "logo": "base64encoded_image_data"
}
```

**刪除診所**
```
DELETE /api/v1/clinics/{clinicId}
```

**權限要求**: `clinics:delete`  
**描述**: 刪除診所（邏輯刪除）

#### 3.2.2 診所設置 API

**獲取診所設置**
```
GET /api/v1/clinics/{clinicId}/settings
```

**權限要求**: `clinics:read` 或 `settings:read`  
**描述**: 獲取診所的設置資訊

**更新診所設置**
```
PUT /api/v1/clinics/{clinicId}/settings
```

**權限要求**: `clinics:update` 或 `settings:update`  
**描述**: 更新診所設置  
**請求體**:
```json
{
  "workingHours": {
    "monday": {"start": "08:30", "end": "18:30", "isOpen": true},
    "tuesday": {"start": "08:30", "end": "18:30", "isOpen": true},
    "wednesday": {"start": "08:30", "end": "18:30", "isOpen": true},
    "thursday": {"start": "08:30", "end": "18:30", "isOpen": true},
    "friday": {"start": "08:30", "end": "18:30", "isOpen": true},
    "saturday": {"start": "09:00", "end": "13:00", "isOpen": true},
    "sunday": {"isOpen": false}
  },
  "holidays": [
    {"date": "2023-01-01", "name": "元旦", "isRecurring": true},
    {"date": "2023-02-10", "name": "農曆春節", "isRecurring": false}
  ],
  "appointmentRules": {
    "defaultDuration": 15,
    "minAdvanceTime": 1,
    "maxAdvanceTime": 30
  },
  "notificationSettings": {
    "enableSMS": true,
    "enableEmail": true,
    "reminderTime": 24
  }
}
```

**獲取診所假日**
```
GET /api/v1/clinics/{clinicId}/holidays
```

**權限要求**: `clinics:read` 或 `settings:read`  
**描述**: 獲取診所假日列表  
**查詢參數**:
- `year` (選填): 特定年份的假日，預設為當年
- `includeRecurring` (選填): 是否包含每年重複的假日，預設為 true

### 3.3 部門管理 API

#### 3.3.1 部門 CRUD API

**獲取診所部門清單**
```
GET /api/v1/clinics/{clinicId}/departments
```

**權限要求**: `departments:read`  
**描述**: 獲取診所的所有部門

**創建新部門**
```
POST /api/v1/clinics/{clinicId}/departments
```

**權限要求**: `departments:create`  
**描述**: 在診所內創建新部門  
**請求體**:
```json
{
  "name": "心臟內科",
  "description": "專門處理心臟相關疾病",
  "color": "#FF5733"
}
```

**獲取部門詳情**
```
GET /api/v1/departments/{departmentId}
```

**權限要求**: `departments:read`  
**描述**: 獲取部門詳細資訊

**更新部門**
```
PUT /api/v1/departments/{departmentId}
```

**權限要求**: `departments:update`  
**描述**: 更新部門資訊  
**請求體**:
```json
{
  "name": "心血管內科",
  "description": "專門處理心臟和血管相關疾病",
  "color": "#F75C03"
}
```

**刪除部門**
```
DELETE /api/v1/departments/{departmentId}
```

**權限要求**: `departments:delete`  
**描述**: 刪除部門（僅當沒有關聯的醫師時）

### 3.4 醫師管理 API

#### 3.4.1 醫師 CRUD API

**獲取醫師列表**
```
GET /api/v1/clinics/{clinicId}/doctors
```

**權限要求**: `doctors:read`  
**描述**: 獲取診所的所有醫師  
**查詢參數**:
- `departmentId` (選填): 過濾特定部門的醫師
- `search` (選填): 搜尋醫師姓名
- `page` (選填): 頁碼，預設為 1
- `limit` (選填): 每頁數量，預設為 20

**創建新醫師**
```
POST /api/v1/clinics/{clinicId}/doctors
```

**權限要求**: `doctors:create`  
**描述**: 在診所中新增醫師  
**請求體**:
```json
{
  "name": "張醫師",
  "departmentId": "clk3d5x1a0001xys7efgh5678",
  "title": "主治醫師",
  "specialty": "心臟科專科",
  "licenseNumber": "MED-12345",
  "bio": "專精於心血管疾病治療，有15年臨床經驗",
  "avatar": "base64encoded_image_data",
  "userId": "clk3d5x1a0001xys7ijkl9012"
}
```

**獲取醫師詳情**
```
GET /api/v1/doctors/{doctorId}
```

**權限要求**: `doctors:read`  
**描述**: 獲取醫師詳細資訊

**更新醫師資訊**
```
PUT /api/v1/doctors/{doctorId}
```

**權限要求**: `doctors:update`  
**描述**: 更新醫師資訊  
**請求體**:
```json
{
  "name": "張大明醫師",
  "departmentId": "clk3d5x1a0001xys7efgh5678",
  "title": "資深主治醫師",
  "specialty": "心臟科專科",
  "bio": "專精於心血管疾病治療，有20年臨床經驗",
  "avatar": "base64encoded_image_data"
}
```

**刪除醫師**
```
DELETE /api/v1/doctors/{doctorId}
```

**權限要求**: `doctors:delete`  
**描述**: 刪除醫師（只能刪除沒有預約的醫師）

#### 3.4.2 醫師排班 API

**獲取醫師排班**
```
GET /api/v1/doctors/{doctorId}/schedule
```

**權限要求**: `doctors:read` 或 `schedule:read`  
**描述**: 獲取醫師的排班信息  
**查詢參數**:
- `startDate` (選填): 開始日期，預設為當天
- `endDate` (選填): 結束日期，預設為一週後

**更新醫師排班**
```
PUT /api/v1/doctors/{doctorId}/schedule
```

**權限要求**: `doctors:update` 或 `schedule:update`  
**描述**: 更新醫師排班  
**請求體**:
```json
{
  "schedule": [
    {
      "date": "2023-05-01",
      "timeSlots": [
        {"start": "09:00", "end": "12:00", "roomId": "clk3d5x1a0001xys7mnop3456"},
        {"start": "14:00", "end": "17:00", "roomId": "clk3d5x1a0001xys7mnop3456"}
      ]
    },
    {
      "date": "2023-05-02",
      "timeSlots": [
        {"start": "09:00", "end": "12:00", "roomId": "clk3d5x1a0001xys7mnop3456"}
      ]
    }
  ]
}
```

### 3.5 診間管理 API

**獲取診間列表**
```
GET /api/v1/clinics/{clinicId}/rooms
```

**權限要求**: `rooms:read`  
**描述**: 獲取診所的所有診間

**創建新診間**
```
POST /api/v1/clinics/{clinicId}/rooms
```

**權限要求**: `rooms:create`  
**描述**: 在診所中新增診間  
**請求體**:
```json
{
  "name": "診間 101",
  "description": "一樓主診間",
  "status": "CLOSED"
}
```

**獲取診間詳情**
```
GET /api/v1/rooms/{roomId}
```

**權限要求**: `rooms:read`  
**描述**: 獲取診間詳細資訊

**更新診間資訊**
```
PUT /api/v1/rooms/{roomId}
```

**權限要求**: `rooms:update`  
**描述**: 更新診間資訊  
**請求體**:
```json
{
  "name": "診間 101A",
  "description": "一樓主診間 (已重新裝修)",
  "status": "OPEN"
}
```

**刪除診間**
```
DELETE /api/v1/rooms/{roomId}
```

**權限要求**: `rooms:delete`  
**描述**: 刪除診間

### 3.6 使用者管理 API

**獲取使用者列表**
```
GET /api/v1/users
```

**權限要求**: `users:read`  
**描述**: 獲取系統中的使用者列表  
**查詢參數**:
- `search` (選填): 搜尋使用者名稱或郵箱
- `clinicId` (選填): 過濾特定診所的使用者
- `roleId` (選填): 過濾特定角色的使用者
- `isActive` (選填): 過濾是否活躍的使用者
- `page` (選填): 頁碼，預設為 1
- `limit` (選填): 每頁數量，預設為 20

**創建新使用者**
```
POST /api/v1/users
```

**權限要求**: `users:create`  
**描述**: 創建新使用者  
**請求體**:
```json
{
  "name": "王小明",
  "email": "user@example.com",
  "password": "securePassword123",
  "phone": "0912345678",
  "clinics": [
    {
      "clinicId": "clk3d5x1a0001xys7abcd1234",
      "roleId": "clk3d5x1a0001xys7qrst7890"
    }
  ]
}
```

**獲取使用者詳情**
```
GET /api/v1/users/{userId}
```

**權限要求**: `users:read`  
**描述**: 獲取使用者詳細資訊

**更新使用者資訊**
```
PUT /api/v1/users/{userId}
```

**權限要求**: `users:update`  
**描述**: 更新使用者資訊  
**請求體**:
```json
{
  "name": "王大明",
  "phone": "0987654321",
  "avatar": "base64encoded_image_data",
  "isActive": true
}
```

**刪除使用者**
```
DELETE /api/v1/users/{userId}
```

**權限要求**: `users:delete`  
**描述**: 刪除使用者（邏輯刪除）

## 4. 權限與 API 關係映射

下表列出主要的權限與相對應的 API 關係：

| 權限代碼                   | API 端點                                 | HTTP 方法 | 描述           |
| -------------------------- | ---------------------------------------- | --------- | -------------- |
| `permissions:read`         | `/api/v1/permissions`                    | GET       | 獲取權限列表   |
| `roles:read`               | `/api/v1/roles`                          | GET       | 獲取角色列表   |
| `roles:create`             | `/api/v1/roles`                          | POST      | 創建角色       |
| `roles:update`             | `/api/v1/roles/{roleId}`                 | PUT       | 更新角色       |
| `roles:delete`             | `/api/v1/roles/{roleId}`                 | DELETE    | 刪除角色       |
| `roles:manage_permissions` | `/api/v1/roles/{roleId}/permissions`     | PUT       | 管理角色權限   |
| `clinics:read`             | `/api/v1/clinics`                        | GET       | 獲取診所列表   |
| `clinics:create`           | `/api/v1/clinics`                        | POST      | 創建診所       |
| `clinics:update`           | `/api/v1/clinics/{clinicId}`             | PUT       | 更新診所資訊   |
| `clinics:delete`           | `/api/v1/clinics/{clinicId}`             | DELETE    | 刪除診所       |
| `settings:read`            | `/api/v1/clinics/{clinicId}/settings`    | GET       | 獲取診所設置   |
| `settings:update`          | `/api/v1/clinics/{clinicId}/settings`    | PUT       | 更新診所設置   |
| `departments:read`         | `/api/v1/clinics/{clinicId}/departments` | GET       | 獲取部門列表   |
| `departments:create`       | `/api/v1/clinics/{clinicId}/departments` | POST      | 創建部門       |
| `departments:update`       | `/api/v1/departments/{departmentId}`     | PUT       | 更新部門資訊   |
| `departments:delete`       | `/api/v1/departments/{departmentId}`     | DELETE    | 刪除部門       |
| `doctors:read`             | `/api/v1/clinics/{clinicId}/doctors`     | GET       | 獲取醫師列表   |
| `doctors:create`           | `/api/v1/clinics/{clinicId}/doctors`     | POST      | 創建醫師       |
| `doctors:update`           | `/api/v1/doctors/{doctorId}`             | PUT       | 更新醫師資訊   |
| `doctors:delete`           | `/api/v1/doctors/{doctorId}`             | DELETE    | 刪除醫師       |
| `schedule:read`            | `/api/v1/doctors/{doctorId}/schedule`    | GET       | 獲取醫師排班   |
| `schedule:update`          | `/api/v1/doctors/{doctorId}/schedule`    | PUT       | 更新醫師排班   |
| `rooms:read`               | `/api/v1/clinics/{clinicId}/rooms`       | GET       | 獲取診間列表   |
| `rooms:create`             | `/api/v1/clinics/{clinicId}/rooms`       | POST      | 創建診間       |
| `rooms:update`             | `/api/v1/rooms/{roomId}`                 | PUT       | 更新診間資訊   |
| `rooms:delete`             | `/api/v1/rooms/{roomId}`                 | DELETE    | 刪除診間       |
| `users:read`               | `/api/v1/users`                          | GET       | 獲取使用者列表 |
| `users:create`             | `/api/v1/users`                          | POST      | 創建使用者     |
| `users:update`             | `/api/v1/users/{userId}`                 | PUT       | 更新使用者資訊 |
| `users:delete`             | `/api/v1/users/{userId}`                 | DELETE    | 刪除使用者     |
| `patients:read`            | `/api/v1/patients`                       | GET       | 獲取病患列表   |
| `patients:create`          | `/api/v1/patients`                       | POST      | 創建病患       |
| `patients:update`          | `/api/v1/patients/{patientId}`           | PUT       | 更新病患資訊   |
| `appointments:read`        | `/api/v1/appointments`                   | GET       | 獲取預約列表   |
| `appointments:create`      | `/api/v1/appointments`                   | POST      | 創建預約       |
| `appointments:update`      | `/api/v1/appointments/{id}`              | PUT       | 更新預約資訊   |
| `stats:read`               | `/api/v1/stats/dashboard`                | GET       | 獲取統計資料   |
| `activity-logs:read`       | `/api/v1/activity-logs`                  | GET       | 獲取活動日誌   |


## 5. 角色預設權限矩陣

下表列出各角色預設被賦予的權限：

| 權限 \ 角色                | SUPER_ADMIN | CLINIC_ADMIN | DOCTOR | NURSE | RECEPTIONIST | STAFF |
| -------------------------- | ----------- | ------------ | ------ | ----- | ------------ | ----- |
| `permissions:read`         | ✓           | ✓            | -      | -     | -            | -     |
| `roles:read`               | ✓           | ✓            | -      | -     | -            | -     |
| `roles:create`             | ✓           | -            | -      | -     | -            | -     |
| `roles:update`             | ✓           | -            | -      | -     | -            | -     |
| `roles:delete`             | ✓           | -            | -      | -     | -            | -     |
| `roles:manage_permissions` | ✓           | -            | -      | -     | -            | -     |
| `clinics:read`             | ✓           | ✓            | ✓      | ✓     | ✓            | ✓     |
| `clinics:create`           | ✓           | -            | -      | -     | -            | -     |
| `clinics:update`           | ✓           | ✓            | -      | -     | -            | -     |
| `clinics:delete`           | ✓           | -            | -      | -     | -            | -     |
| `settings:read`            | ✓           | ✓            | ✓      | ✓     | ✓            | ✓     |
| `settings:update`          | ✓           | ✓            | -      | -     | -            | -     |
| `departments:read`         | ✓           | ✓            | ✓      | ✓     | ✓            | ✓     |
| `departments:create`       | ✓           | ✓            | -      | -     | -            | -     |
| `departments:update`       | ✓           | ✓            | -      | -     | -            | -     |
| `departments:delete`       | ✓           | ✓            | -      | -     | -            | -     |
| `doctors:read`             | ✓           | ✓            | ✓      | ✓     | ✓            | ✓     |
| `doctors:create`           | ✓           | ✓            | -      | -     | -            | -     |
| `doctors:update`           | ✓           | ✓            | ✓      | -     | -            | -     |
| `doctors:delete`           | ✓           | ✓            | -      | -     | -            | -     |
| `schedule:read`            | ✓           | ✓            | ✓      | ✓     | ✓            | ✓     |
| `schedule:update`          | ✓           | ✓            | -      | ✓     | ✓            | -     |
| `rooms:read`               | ✓           | ✓            | ✓      | ✓     | ✓            | ✓     |
| `rooms:create`             | ✓           | ✓            | -      | -     | -            | -     |
| `rooms:update`             | ✓           | ✓            | -      | ✓     | ✓            | -     |
| `rooms:delete`             | ✓           | ✓            | -      | -     | -            | -     |
| `users:read`               | ✓           | ✓            | -      | -     | -            | -     |
| `users:create`             | ✓           | ✓            | -      | -     | -            | -     |
| `users:update`             | ✓           | ✓            | -      | -     | -            | -     |
| `users:delete`             | ✓           | -            | -      | -     | -            | -     |
| `patients:read`            | ✓           | ✓            | ✓      | ✓     | ✓            | ✓     |
| `patients:create`          | ✓           | ✓            | -      | ✓     | ✓            | -     |
| `patients:update`          | ✓           | ✓            | ✓      | ✓     | ✓            | -     |
| `appointments:read`        | ✓           | ✓            | ✓      | ✓     | ✓            | ✓     |
| `appointments:create`      | ✓           | ✓            | ✓      | ✓     | ✓            | -     |
| `appointments:update`      | ✓           | ✓            | ✓      | ✓     | ✓            | -     |
| `stats:read`               | ✓           | ✓            | ✓      | ✓     | ✓            | ✓     |
| `activity-logs:read`       | ✓           | ✓            | -      | -     | -            | -     |

## 6. 實作指南

### 6.1 權限系統實作

#### 6.1.1 權限檢查守衛 (Guard)

在 NestJS 中實作權限檢查守衛：

```typescript
// permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from './permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 取得路由要求的權限
    const requiredPermission = this.reflector.get<string>(
      'requiredPermission',
      context.getHandler(),
    );

    // 如果路由沒有定義權限要求，預設允許訪問
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 檢查使用者是否已認證
    if (!user) {
      throw new UnauthorizedException('User is not authenticated');
    }

    // 檢查使用者是否有選擇診所
    const clinicId = request.headers['x-clinic-id'] || user.currentClinicId;
    if (!clinicId) {
      throw new ForbiddenException('No clinic selected');
    }

    // 檢查使用者是否有權限
    const hasPermission = await this.permissionsService.checkUserPermission(
      user.id,
      clinicId,
      requiredPermission,
    );

    if (!hasPermission) {
      throw new ForbiddenException(`User does not have required permission: ${requiredPermission}`);
    }

    return true;
  }
}
```

#### 6.1.2 權限裝飾器

建立自定義裝飾器，用於標記需要特定權限的路由：

```typescript
// require-permission.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const RequirePermission = (permission: string) => 
  SetMetadata('requiredPermission', permission);
```

#### 6.1.3 權限服務

實作權限檢查服務：

```typescript
// permissions.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class PermissionsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async checkUserPermission(
    userId: string,
    clinicId: string,
    permissionCode: string,
  ): Promise<boolean> {
    // 嘗試從快取取得權限
    const cacheKey = `user:${userId}:clinic:${clinicId}:permissions`;
    let userPermissions = await this.cacheService.get<string[]>(cacheKey);

    if (!userPermissions) {
      // 如果快取中沒有，則從資料庫查詢
      userPermissions = await this.getUserPermissions(userId, clinicId);
      
      // 儲存到快取，有效時間 15 分鐘
      await this.cacheService.set(cacheKey, userPermissions, 15 * 60);
    }

    return userPermissions.includes(permissionCode);
  }

  private async getUserPermissions(
    userId: string,
    clinicId: string,
  ): Promise<string[]> {
    // 查詢使用者在特定診所的角色
    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_clinicId: {
          userId,
          clinicId,
        },
      },
      include: {
        systemRole: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!userRole) {
      return [];
    }

    // 取得使用者角色的所有權限代碼
    return userRole.systemRole.permissions.map(rp => rp.permission.code);
  }

  async getAllPermissions(): Promise<any[]> {
    return await this.prisma.permission.findMany({
      orderBy: {
        resource: 'asc',
      },
    });
  }

  async getPermissionsByResource(resource: string): Promise<any[]> {
    return await this.prisma.permission.findMany({
      where: {
        resource,
      },
      orderBy: {
        action: 'asc',
      },
    });
  }
}
```

#### 6.1.4 在控制器中使用

以下是權限裝飾器的實際使用範例：

```typescript
// clinics.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto, UpdateClinicDto } from './dto';

@Controller('api/v1/clinics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get()
  @RequirePermission('clinics:read')
  async getClinics() {
    return this.clinicsService.findAll();
  }

  @Post()
  @RequirePermission('clinics:create')
  async createClinic(@Body() createClinicDto: CreateClinicDto) {
    return this.clinicsService.create(createClinicDto);
  }

  @Get(':id')
  @RequirePermission('clinics:read')
  async getClinicById(@Param('id') id: string) {
    return this.clinicsService.findById(id);
  }

  @Put(':id')
  @RequirePermission('clinics:update')
  async updateClinic(
    @Param('id') id: string,
    @Body() updateClinicDto: UpdateClinicDto,
  ) {
    return this.clinicsService.update(id, updateClinicDto);
  }

  @Delete(':id')
  @RequirePermission('clinics:delete')
  async deleteClinic(@Param('id') id: string) {
    return this.clinicsService.remove(id);
  }
}
```

### 6.2 權限資料初始化

在系統初始化時需要建立基本權限和角色：

```typescript
// permission-seeder.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionSeederService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // 檢查是否已有權限資料
    const permissionsCount = await this.prisma.permission.count();
    
    if (permissionsCount === 0) {
      await this.seedPermissions();
    }
    
    // 檢查是否已有角色資料
    const rolesCount = await this.prisma.systemRole.count();
    
    if (rolesCount === 0) {
      await this.seedRoles();
    }
  }

  async seedPermissions() {
    const permissionsData = [
      // Permissions 權限
      { code: 'permissions:read', name: '查看權限列表', resource: 'permissions', action: 'read' },
      
      // Roles 角色
      { code: 'roles:read', name: '查看角色列表', resource: 'roles', action: 'read' },
      { code: 'roles:create', name: '創建角色', resource: 'roles', action: 'create' },
      { code: 'roles:update', name: '更新角色', resource: 'roles', action: 'update' },
      { code: 'roles:delete', name: '刪除角色', resource: 'roles', action: 'delete' },
      { code: 'roles:manage_permissions', name: '管理角色權限', resource: 'roles', action: 'manage_permissions' },
      
      // Clinics 診所
      { code: 'clinics:read', name: '查看診所列表', resource: 'clinics', action: 'read' },
      { code: 'clinics:create', name: '創建診所', resource: 'clinics', action: 'create' },
      { code: 'clinics:update', name: '更新診所', resource: 'clinics', action: 'update' },
      { code: 'clinics:delete', name: '刪除診所', resource: 'clinics', action: 'delete' },
      
      // Settings 設置
      { code: 'settings:read', name: '查看設置', resource: 'settings', action: 'read' },
      { code: 'settings:update', name: '更新設置', resource: 'settings', action: 'update' },
      
      // ...其他權限
    ];

    // 批量創建權限
    await this.prisma.permission.createMany({
      data: permissionsData,
      skipDuplicates: true,
    });
  }

  async seedRoles() {
    // 創建超級管理員角色
    const superAdminRole = await this.prisma.systemRole.create({
      data: {
        code: 'SUPER_ADMIN',
        name: '系統超級管理員',
        description: '擁有系統所有權限',
        isDefault: false,
      },
    });
    
    // 獲取所有權限
    const allPermissions = await this.prisma.permission.findMany();
    
    // 為超級管理員角色分配所有權限
    await Promise.all(
      allPermissions.map(permission => 
        this.prisma.rolePermission.create({
          data: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        })
      )
    );
    
    // 創建其他預設角色，並分配權限
    // ...略（請參考權限矩陣表格）
  }
}
```

### 6.3 診所設置實作

**ClinicSettings DTO**:

```typescript
// clinic-settings.dto.ts
import { Type } from 'class-transformer';
import { IsObject, IsOptional, ValidateNested, IsBoolean, IsString, IsNumber, IsArray, IsDateString } from 'class-validator';

class WorkingHoursDTO {
  @IsString()
  start: string;
  
  @IsString()
  end: string;
  
  @IsBoolean()
  isOpen: boolean;
}

class WorkingDaysDTO {
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDTO)
  monday?: WorkingHoursDTO;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDTO)
  tuesday?: WorkingHoursDTO;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDTO)
  wednesday?: WorkingHoursDTO;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDTO)
  thursday?: WorkingHoursDTO;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDTO)
  friday?: WorkingHoursDTO;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDTO)
  saturday?: WorkingHoursDTO;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDTO)
  sunday?: WorkingHoursDTO;
}

class HolidayDTO {
  @IsDateString()
  date: string;
  
  @IsString()
  name: string;
  
  @IsBoolean()
  isRecurring: boolean;
}

class AppointmentRulesDTO {
  @IsNumber()
  defaultDuration: number;
  
  @IsNumber()
  minAdvanceTime: number;
  
  @IsNumber()
  maxAdvanceTime: number;
}

class NotificationSettingsDTO {
  @IsBoolean()
  enableSMS: boolean;
  
  @IsBoolean()
  enableEmail: boolean;
  
  @IsNumber()
  reminderTime: number;
}

export class ClinicSettingsDTO {
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingDaysDTO)
  workingHours?: WorkingDaysDTO;
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HolidayDTO)
  holidays?: HolidayDTO[];
  
  @IsOptional()
  @ValidateNested()
  @Type(() => AppointmentRulesDTO)
  appointmentRules?: AppointmentRulesDTO;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDTO)
  notificationSettings?: NotificationSettingsDTO;
}
```

**設置控制器**:

```typescript
// clinic-settings.controller.ts
import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ClinicSettingsDTO } from './dto/clinic-settings.dto';
import { ClinicSettingsService } from './clinic-settings.service';

@Controller('api/v1/clinics/:clinicId/settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClinicSettingsController {
  constructor(private readonly settingsService: ClinicSettingsService) {}

  @Get()
  @RequirePermission('settings:read')
  async getSettings(@Param('clinicId') clinicId: string) {
    return this.settingsService.getSettings(clinicId);
  }

  @Put()
  @RequirePermission('settings:update')
  async updateSettings(
    @Param('clinicId') clinicId: string,
    @Body() settingsDto: ClinicSettingsDTO,
  ) {
    return this.settingsService.updateSettings(clinicId, settingsDto);
  }
}
```

### 6.4 醫師排班實作

**醫師排班 DTO**:

```typescript
// doctor-schedule.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsString, ValidateNested } from 'class-validator';

class TimeSlotDTO {
  @IsString()
  start: string;
  
  @IsString()
  end: string;
  
  @IsString()
  roomId: string;
}

class ScheduleDayDTO {
  @IsDateString()
  date: string;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDTO)
  timeSlots: TimeSlotDTO[];
}

export class DoctorScheduleDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDayDTO)
  schedule: ScheduleDayDTO[];
}
```

**醫師排班控制器**:

```typescript
// doctor-schedule.controller.ts
import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { DoctorScheduleDTO } from './dto/doctor-schedule.dto';
import { DoctorScheduleService } from './doctor-schedule.service';

@Controller('api/v1/doctors/:doctorId/schedule')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DoctorScheduleController {
  constructor(private readonly scheduleService: DoctorScheduleService) {}

  @Get()
  @RequirePermission('schedule:read')
  async getSchedule(
    @Param('doctorId') doctorId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.scheduleService.getSchedule(doctorId, startDate, endDate);
  }

  @Put()
  @RequirePermission('schedule:update')
  async updateSchedule(
    @Param('doctorId') doctorId: string,
    @Body() scheduleDto: DoctorScheduleDTO,
  ) {
    return this.scheduleService.updateSchedule(doctorId, scheduleDto);
  }
}
```

## 7. 前端整合指南

### 7.1 權限相關前端整合

#### 7.1.1 權限 Hook

建立一個用於檢查權限的 React Hook：

```typescript
// usePermission.ts
import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/auth_context';

export const usePermission = () => {
  const { user, userPermissions } = useContext(AuthContext);

  const hasPermission = useMemo(() => {
    return (permissionCode: string): boolean => {
      if (!user || !userPermissions) {
        return false;
      }
      
      return userPermissions.includes(permissionCode);
    };
  }, [user, userPermissions]);

  return { hasPermission };
};
```

#### 7.1.2 權限元件

建立一個基於權限的條件渲染元件：

```tsx
// RequirePermission.tsx
import React from 'react';
import { usePermission } from '../hooks/usePermission';

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { hasPermission } = usePermission();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
```

#### 7.1.3 使用範例

```tsx
// ClinicSettingsPage.tsx
import React from 'react';
import { RequirePermission } from '../components/RequirePermission';

export const ClinicSettingsPage: React.FC = () => {
  // ... 頁面邏輯
  
  return (
    <div>
      <h1>診所設置</h1>
      
      {/* 所有用戶都可以查看設置 */}
      <section>
        <h2>基本設置</h2>
        {/* 設置內容 */}
      </section>
      
      {/* 只有有更新權限的用戶才能看到更新按鈕 */}
      <RequirePermission permission="settings:update">
        <div className="actions">
          <button type="button" onClick={handleSave}>儲存設置</button>
        </div>
      </RequirePermission>
    </div>
  );
};
```

### 7.2 API 客戶端整合

#### 7.2.1 擴展 API 客戶端

```typescript
// api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { refreshToken } from './auth_service';

class ApiClient {
  private instance: AxiosInstance;
  private clinicId: string | null = null;
  
  constructor() {
    this.instance = axios.create({
      baseURL: '/api/v1',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // 請求攔截器
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (this.clinicId) {
          config.headers['X-Clinic-Id'] = this.clinicId;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // 回應攔截器
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        // 如果是授權錯誤且有 refreshToken，則嘗試重新獲取 token
        if (error.response && error.response.status === 401) {
          try {
            // 刷新 token
            const newToken = await refreshToken();
            
            if (newToken) {
              // 更新原始請求的 token
              error.config.headers.Authorization = `Bearer ${newToken}`;
              // 重新發送請求
              return this.instance(error.config);
            }
          } catch (refreshError) {
            // 刷新 token 失敗，需要重新登入
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  setClinicId(clinicId: string | null) {
    this.clinicId = clinicId;
  }
  
  // 通用 CRUD 方法
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }
  
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }
  
  // 指定 API 端點
  
  // 角色相關
  getRoles() {
    return this.get('/roles');
  }
  
  createRole(data: any) {
    return this.post('/roles', data);
  }
  
  updateRole(roleId: string, data: any) {
    return this.put(`/roles/${roleId}`, data);
  }
  
  updateRolePermissions(roleId: string, data: any) {
    return this.put(`/roles/${roleId}/permissions`, data);
  }
  
  // 診所相關
  getClinics() {
    return this.get('/clinics');
  }
  
  createClinic(data: any) {
    return this.post('/clinics', data);
  }
  
  getClinicById(clinicId: string) {
    return this.get(`/clinics/${clinicId}`);
  }
  
  updateClinic(clinicId: string, data: any) {
    return this.put(`/clinics/${clinicId}`, data);
  }
  
  getClinicSettings(clinicId: string) {
    return this.get(`/clinics/${clinicId}/settings`);
  }
  
  updateClinicSettings(clinicId: string, data: any) {
    return this.put(`/clinics/${clinicId}/settings`, data);
  }
  
  // ... 其他 API 方法
}

export const api = new ApiClient();
```

## 8. 部署與遷移建議

### 8.1 資料庫遷移

使用 Prisma 進行資料庫遷移：

```bash
# 產生新的遷移
npx prisma migrate dev --name add_permission_system

# 應用遷移到生產環境
npx prisma migrate deploy
```

### 8.2 系統更新步驟

1. **更新前備份**：進行資料庫完整備份
2. **程式碼部署**：更新後端程式碼
3. **執行遷移**：應用資料庫遷移腳本
4. **初始化資料**：執行權限和角色初始化
5. **更新前端**：部署前端程式碼
6. **系統測試**：進行關鍵功能測試
7. **監控系統**：特別關注性能和錯誤

### 8.3 向下兼容性考慮

1. **保留原有 API**：不刪除或修改已有 API 端點
2. **角色映射**：將原有角色映射到新權限系統
3. **權限預設值**：為現有使用者賦予適當的預設權限
4. **優雅降級**：當缺少權限時，提供友好的錯誤訊息

## 9. 測試策略

### 9.1 單元測試

為各層級實作單元測試：

```typescript
// permissions.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

// 模擬資料
const mockUserRole = {
  userId: 'user1',
  clinicId: 'clinic1',
  systemRole: {
    id: 'role1',
    code: 'DOCTOR',
    name: '醫師',
    permissions: [
      { permission: { code: 'patients:read' } },
      { permission: { code: 'appointments:read' } },
    ],
  },
};

// 模擬 PrismaService
const mockPrismaService = {
  userRole: {
    findUnique: jest.fn().mockResolvedValue(mockUserRole),
  },
  permission: {
    findMany: jest.fn(),
  },
};

// 模擬 CacheService
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    
    // 重設 mock
    jest.clearAllMocks();
  });

  describe('checkUserPermission', () => {
    it('should return true when user has the permission', async () => {
      // 模擬快取未命中
      mockCacheService.get.mockResolvedValue(null);
      
      const result = await service.checkUserPermission('user1', 'clinic1', 'patients:read');
      
      expect(result).toBe(true);
      expect(mockPrismaService.userRole.findUnique).toHaveBeenCalledWith({
        where: {
          userId_clinicId: {
            userId: 'user1',
            clinicId: 'clinic1',
          },
        },
        include: expect.any(Object),
      });
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should return false when user does not have the permission', async () => {
      // 模擬快取未命中
      mockCacheService.get.mockResolvedValue(null);
      
      const result = await service.checkUserPermission('user1', 'clinic1', 'doctors:update');
      
      expect(result).toBe(false);
    });

    it('should use cached permissions when available', async () => {
      // 模擬快取命中
      mockCacheService.get.mockResolvedValue(['patients:read', 'appointments:read']);
      
      const result = await service.checkUserPermission('user1', 'clinic1', 'patients:read');
      
      expect(result).toBe(true);
      expect(mockPrismaService.userRole.findUnique).not.toHaveBeenCalled();
    });
  });
});
```

### 9.2 整合測試

實作整合測試，驗證 API 行為：

```typescript
// clinics.controller.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('ClinicsController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let adminToken: string;
  let doctorToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
    
    // 設置全局驗證管道
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    
    await app.init();
    
    // 創建測試用戶和權限資料
    await setupTestData();
    
    // 生成測試用 JWT Token
    adminToken = generateToken('admin', 'SUPER_ADMIN');
    doctorToken = generateToken('doctor', 'DOCTOR');
  });

  afterAll(async () => {
    // 清除測試資料
    await cleanupTestData();
    await app.close();
  });

  function generateToken(userId: string, role: string) {
    return jwtService.sign({
      sub: userId,
      role,
      clinicId: 'test-clinic',
    });
  }

  async function setupTestData() {
    // 建立測試資料...
  }

  async function cleanupTestData() {
    // 清除測試資料...
  }

  describe('/api/v1/clinics (GET)', () => {
    it('should return all clinics with admin role', () => {
      return request(app.getHttpServer())
        .get('/api/v1/clinics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return 403 with doctor role', () => {
      return request(app.getHttpServer())
        .get('/api/v1/clinics')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(403);
    });
  });

  describe('/api/v1/clinics (POST)', () => {
    it('should create a clinic with admin role', () => {
      return request(app.getHttpServer())
        .post('/api/v1/clinics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Clinic',
          address: 'Test Address',
          phone: '0223456789',
          email: 'test@example.com',
        })
        .expect(201)
        .expect(res => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toEqual('Test Clinic');
        });
    });

    it('should return 403 with doctor role', () => {
      return request(app.getHttpServer())
        .post('/api/v1/clinics')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          name: 'Test Clinic',
          address: 'Test Address',
          phone: '0223456789',
        })
        .expect(403);
    });
  });
});
```

### 9.3 端到端測試

使用 Cypress 進行前端端到端測試：

```javascript
// cypress/integration/clinic-settings.spec.js
describe('Clinic Settings', () => {
  beforeEach(() => {
    // 登入系統
    cy.login('admin@example.com', 'password');
    
    // 選擇診所
    cy.selectClinic('Test Clinic');
    
    // 導航到設置頁面
    cy.visit('/settings');
  });

  it('should display clinic settings', () => {
    cy.contains('h1', '診所設置');
    cy.contains('工作時間設置');
    cy.contains('假日設置');
  });

  it('should update working hours', () => {
    // 修改週一工作時間
    cy.get('[data-cy=monday-start]').clear().type('09:00');
    cy.get('[data-cy=monday-end]').clear().type('18:00');
    
    // 保存設置
    cy.get('[data-cy=save-settings]').click();
    
    // 驗證成功訊息
    cy.contains('設置已更新').should('be.visible');
    
    // 重新整理頁面
    cy.reload();
    
    // 確認設置已保存
    cy.get('[data-cy=monday-start]').should('have.value', '09:00');
    cy.get('[data-cy=monday-end]').should('have.value', '18:00');
  });

  it('should show error for invalid working hours', () => {
    // 輸入無效的時間
    cy.get('[data-cy=monday-start]').clear().type('invalid');
    
    // 保存設置
    cy.get('[data-cy=save-settings]').click();
    
    // 驗證錯誤訊息
    cy.contains('工作時間格式無效').should('be.visible');
  });
});
```

## 10. 效能考量

### 10.1 權限快取策略

使用多層快取策略優化權限檢查：

1. **記憶體快取**：每次請求期間緩存使用者權限
2. **Redis 快取**：持續會話期間緩存權限，有效期 15 分鐘
3. **預緩存常用操作**：預先載入高頻操作的權限

```typescript
// cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  private memoryCache: Map<string, any> = new Map();
  
  constructor(private redisService: RedisService) {}
  
  async get<T>(key: string): Promise<T | null> {
    // 先檢查記憶體快取
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    
    // 從 Redis 獲取
    const value = await this.redisService.get(key);
    
    if (value) {
      // 解析值並存入記憶體快取
      const parsed = JSON.parse(value);
      this.memoryCache.set(key, parsed);
      return parsed;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    // 存入記憶體快取
    this.memoryCache.set(key, value);
    
    // 存入 Redis
    await this.redisService.set(
      key,
      JSON.stringify(value),
      'EX',
      ttlSeconds
    );
  }
  
  async invalidate(key: string): Promise<void> {
    // 從記憶體快取移除
    this.memoryCache.delete(key);
    
    // 從 Redis 移除
    await this.redisService.del(key);
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    // 從 Redis 取得匹配的鍵
    const keys = await this.redisService.keys(pattern);
    
    // 從記憶體和 Redis 移除所有匹配的鍵
    for (const key of keys) {
      this.memoryCache.delete(key);
      await this.redisService.del(key);
    }
  }
}
```

### 10.2 API 請求優化

1. **複合 API**：減少前端 API 請求數量
2. **分頁與篩選**：所有列表 API 支援分頁和篩選
3. **選擇性載入**：支援 GraphQL 風格的欄位選擇

```typescript
// 複合 API 範例
@Get('/clinics/:clinicId/dashboard')
@RequirePermission('clinics:read')
async getClinicDashboard(@Param('clinicId') clinicId: string) {
  const [
    clinicDetails,
    departments,
    todayAppointments,
    stats,
  ] = await Promise.all([
    this.clinicsService.findById(clinicId),
    this.departmentsService.findByClinicId(clinicId),
    this.appointmentsService.findTodayAppointments(clinicId),
    this.statsService.getDashboardStats(clinicId),
  ]);
  
  return {
    clinic: clinicDetails,
    departments,
    todayAppointments,
    stats,
  };
}
```

### 10.3 資料庫優化

1. **索引策略**：為權限查詢添加適當索引
2. **高效查詢**：減少 N+1 查詢問題

```prisma
// 權限相關索引
model Permission {
  id     String @id @default(cuid())
  code   String @unique
  // ...

  @@index([resource, action])
}

model UserRole {
  userId      String
  clinicId    String
  systemRoleId String
  // ...

  @@id([userId, clinicId])
  @@index([userId, systemRoleId])
  @@index([clinicId, systemRoleId])
}

model RolePermission {
  roleId       String
  permissionId String
  // ...

  @@id([roleId, permissionId])
  @@index([permissionId])
}
```

## 11. 安全性考量

### 11.1 權限驗證最佳實踐

1. **主動拒絕原則**：預設拒絕所有訪問，明確允許需要的操作
2. **最小權限原則**：給予用戶完成任務所需的最小權限
3. **定期權限審計**：記錄權限變更，定期審查權限合理性

### 11.2 安全性日誌

擴展活動日誌以包含權限變更：

```typescript
// activity-log.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}
  
  async logActivity(data: {
    userId: string;
    clinicId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    request?: Request;
  }) {
    const { userId, clinicId, action, resource, resourceId, details, request } = data;
    
    return this.prisma.activityLog.create({
      data: {
        userId,
        clinicId,
        action,
        resource,
        resourceId,
        details,
        ipAddress: request?.ip,
        userAgent: request?.headers['user-agent'],
      },
    });
  }
  
  async logPermissionChange(data: {
    userId: string;
    clinicId: string;
    targetUserId: string;
    oldRole?: string;
    newRole?: string;
    oldPermissions?: string[];
    newPermissions?: string[];
    request?: Request;
  }) {
    const {
      userId,
      clinicId,
      targetUserId,
      oldRole,
      newRole,
      oldPermissions,
      newPermissions,
      request,
    } = data;
    
    return this.logActivity({
      userId,
      clinicId,
      action: 'UPDATE',
      resource: 'PERMISSION',
      resourceId: targetUserId,
      details: {
        oldRole,
        newRole,
        oldPermissions,
        newPermissions,
      },
      request,
    });
  }
}
```

## 12. 後續擴展建議

### 12.1 API 版本控制

實作 API 版本控制，方便未來擴展：

```typescript
// main.ts
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 啟用版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  
  await app.listen(3000);
}
bootstrap();
```

### 12.2 未來擴展方向

1. **多因素認證**：為關鍵角色增加雙因素認證
2. **細粒度權限**：實作資源特定權限（如：只能查看特定部門的病患）
3. **自訂角色**：允許診所管理員創建自定義角色
4. **權限申請流程**：實作權限變更申請與審批流程
5. **動態權限策略**：基於使用模式和機器學習的權限推薦

## 13. 結論

本技術規格文件詳細說明了診所管理整合系統在權限管理和 API 擴展方面的設計與實作方案。通過建立完善的 RBAC 權限系統，診所管理功能將更加靈活且安全。同時，擴展後的 API 將更好地支援多診所場景下的複雜業務需求。

實作過程中，需特別注意權限系統的性能、安全性和向下兼容性。建議按照本文檔提供的指南和最佳實踐進行系統擴展，確保功能完善且易於使用。

---

本技術規格文件可作為開發團隊實作參考，具體實作細節可能因實際需求和技術環境而調整。
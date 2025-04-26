# 診所管理系統 API 清單

## 已實作的 API
```
App
    GET
        /
        Welcome message 
Authentication
    POST
        /api/v1/auth/login
        User login
    POST
        /api/v1/auth/register
        User registration
    POST
        /api/v1/auth/firebase
        Firebase token authentication
    GET
        /api/v1/auth/user
        Get current user
    POST
        /api/v1/auth/select-clinic
        Select active clinic
Health
    GET
        /health
        Check system health
```

## 需要實作的 API

### 預約管理 API
```
Appointments
    GET
        /api/v1/appointments
        Get appointments with filters (date, status)
    POST
        /api/v1/appointments
        Create a new appointment
    PUT
        /api/v1/appointments/{appointmentId}
        Update appointment status or details
```

### 病患管理 API
```
Patients
    GET
        /api/v1/patients
        Get all patients or search by patientId
    POST
        /api/v1/patients
        Create a new patient
    PUT
        /api/v1/patients/{patientId}
        Update patient information
```

### 診間管理 API
```
Rooms
    GET
        /api/v1/rooms
        Get all rooms with queue information
    PUT
        /api/v1/rooms/{roomId}
        Update room status (active/inactive)
```

### 科別管理 API
```
Departments
    GET
        /api/v1/departments
        Get all departments
```

### 醫生管理 API
```
Doctors
    GET
        /api/v1/doctors
        Get all doctors (with department information)
```

### 活動日誌 API
```
ActivityLogs
    GET
        /api/v1/activity-logs
        Get activity logs
```

### 統計數據 API
```
Statistics
    GET
        /api/v1/stats/dashboard
        Get dashboard statistics
```

## API 規格細節

以下是每個 API 的詳細規格，包括請求參數和回應格式：

### 預約管理 API (已實作)

#### GET /api/v1/appointments
- **功能**：取得預約列表
- **查詢參數**：
  - `date`: 日期 (YYYY-MM-DD)
  - `status`: 預約狀態 (SCHEDULED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
- **回應**：預約列表

#### POST /api/v1/appointments
- **功能**：建立新預約
- **請求內容**：預約資料
  ```typescript
  {
    patientId: string;
    doctorId?: string;
    departmentId?: string;
    appointmentTime?: string;
    source: 'WALK_IN' | 'PHONE' | 'ONLINE' | 'LINE' | 'APP';
    note?: string;
  }
  ```
- **回應**：新建立的預約資料

#### PUT /api/v1/appointments/{appointmentId}
- **功能**：更新預約狀態或資料
- **路徑參數**：
  - `appointmentId`: 預約 ID
- **請求內容**：更新的預約資料
  ```typescript
  {
    status?: 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    doctorId?: string;
    roomId?: string;
    appointmentTime?: string;
    note?: string;
  }
  ```
- **回應**：更新後的預約資料

### 病患管理 API

#### GET /api/v1/patients
- **功能**：取得病患列表或搜尋特定病患
- **查詢參數**：
  - `patientId`: 病歷號碼 (選填)
  - `name`: 姓名 (選填)
  - `phone`: 電話 (選填)
- **回應**：病患列表或單一病患資料

#### POST /api/v1/patients
- **功能**：建立新病患
- **請求內容**：病患資料
  ```typescript
  {
    name: string;
    nationalId?: string;
    birthDate?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    phone: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    medicalHistory?: object;
    note?: string;
  }
  ```
- **回應**：新建立的病患資料

#### PUT /api/v1/patients/{patientId}
- **功能**：更新病患資料
- **路徑參數**：
  - `patientId`: 病歷號碼
- **請求內容**：更新的病患資料 (部分更新)
- **回應**：更新後的病患資料

### 診間管理 API

#### GET /api/v1/rooms
- **功能**：取得所有診間及其候診資訊
- **回應**：診間列表，包含候診人數和當前狀態

#### PUT /api/v1/rooms/{roomId}
- **功能**：更新診間狀態
- **路徑參數**：
  - `roomId`: 診間 ID
- **請求內容**：
  ```typescript
  {
    isActive: boolean; // 開診或關診狀態
  }
  ```
- **回應**：更新後的診間資料

### 科別管理 API

#### GET /api/v1/departments
- **功能**：取得所有科別
- **回應**：科別列表
  ```typescript
  [
    {
      id: number;
      name: string;
      description?: string;
      color?: string;
    }
  ]
  ```

### 醫生管理 API

#### GET /api/v1/doctors
- **功能**：取得所有醫生
- **回應**：醫生列表
  ```typescript
  [
    {
      id: number;
      fullName: string;
      departmentId: number;
      title?: string;
      specialty?: string;
    }
  ]
  ```

### 活動日誌 API

#### GET /api/v1/activity-logs
- **功能**：取得活動日誌
- **查詢參數**：
  - `limit`: 最大回傳數量 (選填)
  - `offset`: 跳過的數量 (選填)
- **回應**：活動日誌列表

### 統計數據 API

#### GET /api/v1/stats/dashboard
- **功能**：取得儀表板統計數據
- **回應**：包含各種統計數據
  ```typescript
  {
    todayAppointments: number; // 今日預約數
    waitingPatients: number;   // 等候中病患數
    completedAppointments: number; // 已完成看診數
    cancelledAppointments: number; // 取消預約數
    // 可能還有其他統計數據
  }
  ```

## 建議的實作優先順序

根據前端已經串接的 API 調用情況，建議按照以下順序實作 API:

1. **核心預約流程 (已實作)**
   - GET /api/v1/appointments
   - POST /api/v1/appointments
   - PUT /api/v1/appointments/{appointmentId}

2. **基礎資料**
   - GET /api/v1/patients
   - POST /api/v1/patients
   - PUT /api/v1/patients/{patientId}
   - GET /api/v1/departments
   - GET /api/v1/doctors

3. **診間管理**
   - GET /api/v1/rooms
   - PUT /api/v1/rooms/{roomId}

4. **統計與活動追蹤**
   - GET /api/v1/stats/dashboard
   - GET /api/v1/activity-logs

按照上述順序實作，將能夠優先支援系統中最關鍵的預約和病患管理功能，然後再逐步擴展到其他功能區塊。

以上 API 清單根據您提供的前端代碼分析得出，可能需要根據實際業務需求進行調整或擴展。
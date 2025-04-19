# 診所管理整合系統

一個綜合性的診所管理平台，專為台灣的診所設計，整合了線上預約、現場掛號和看診進度追蹤功能，提升工作效率和病患體驗。

## 技術架構

### 前端架構
- **框架**：React 18 + TypeScript
- **狀態管理**：TanStack Query (React Query v5)
- **路由**：React Router v6
- **UI設計**：Tailwind CSS + shadcn/ui 元件
- **表單處理**：React Hook Form + Zod 驗證
- **開發工具**：Vite, ESLint, Prettier

### 後端架構
- **語言框架**：Node.js + NestJS + TypeScript
- **認證**：Firebase Auth + JWT 授權機制 + Auth Guards
- **即時通訊**：MQTT協議
- **MQTT Broker**：Mosquitto/EMQ X
- **ORM**：Prisma
- **API 文件**：Swagger/OpenAPI
- **架構模式**：Clean Architecture

### 資料庫架構
- **主要資料庫**：PostgreSQL
- **多租戶設計**：基於 clinic_id 的隔離架構
- **關聯模型**：使用外鍵保持資料完整性
- **快取層**：Redis

### 部署與 DevOps
- **容器化**：Docker + Docker Compose
- **CI/CD**：GitHub Actions
- **監控**：Prometheus + Grafana
- **日誌管理**：ELK Stack (Elasticsearch, Logstash, Kibana)

## 資料模型設計

### 主要實體

#### 使用 Prisma Schema 定義

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Clinic {
  id             String          @id @default(cuid())
  name           String
  address        String
  phone          String
  email          String?
  logo           String?
  settings       Json?           // 診所設定，如工作時間、休診日等
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  // 關聯
  users          UserClinic[]
  patients       Patient[]
  departments    Department[]
  rooms          Room[]
  doctors        Doctor[]
  appointments   Appointment[]
  activityLogs   ActivityLog[]
}

model User {
  id             String          @id @default(cuid())
  email          String          @unique
  password       String
  name           String
  phone          String?
  avatar         String?
  isActive       Boolean         @default(true)
  lastLoginAt    DateTime?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  // 關聯
  clinics        UserClinic[]
  activityLogs   ActivityLog[]
}

model UserClinic {
  userId         String
  clinicId       String
  role           Role            @default(STAFF)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  // 關聯
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  clinic         Clinic          @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  
  @@id([userId, clinicId])
}

model Patient {
  id             String          @id @default(cuid())
  clinicId       String
  nationalId     String?
  name           String
  birthDate      DateTime?
  gender         Gender?
  phone          String
  email          String?
  address        String?
  emergencyContact String?
  emergencyPhone String?
  medicalHistory Json?
  note           String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  // 關聯
  clinic         Clinic          @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  appointments   Appointment[]
  
  @@unique([clinicId, nationalId])
  @@index([clinicId, phone])
  @@index([clinicId, name])
}

model Department {
  id             String          @id @default(cuid())
  clinicId       String
  name           String
  description    String?
  color          String?         // 用於前端顯示的顏色
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  // 關聯
  clinic         Clinic          @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  doctors        Doctor[]
  
  @@unique([clinicId, name])
}

model Doctor {
  id             String          @id @default(cuid())
  clinicId       String
  departmentId   String
  userId         String?         // 如果醫生同時是系統使用者
  name           String
  title          String?
  specialty      String?
  licenseNumber  String?
  bio            String?
  avatar         String?
  scheduleData   Json?           // 醫生排班資料
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  // 關聯
  clinic         Clinic          @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  department     Department      @relation(fields: [departmentId], references: [id])
  appointments   Appointment[]
  rooms          DoctorRoom[]
  
  @@index([clinicId, name])
}

model Room {
  id             String          @id @default(cuid())
  clinicId       String
  name           String
  description    String?
  status         RoomStatus      @default(CLOSED)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  // 關聯
  clinic         Clinic          @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  doctors        DoctorRoom[]
  appointments   Appointment[]
  
  @@unique([clinicId, name])
}

model DoctorRoom {
  doctorId       String
  roomId         String
  createdAt      DateTime        @default(now())
  
  // 關聯
  doctor         Doctor          @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  room           Room            @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  @@id([doctorId, roomId])
}

model Appointment {
  id             String          @id @default(cuid())
  clinicId       String
  patientId      String
  doctorId       String?
  roomId         String?
  appointmentNumber Int?         // 看診號碼
  appointmentTime DateTime?      // 預約時間
  checkinTime    DateTime?       // 報到時間
  startTime      DateTime?       // 開始看診時間
  endTime        DateTime?       // 結束看診時間
  status         AppointmentStatus @default(SCHEDULED)
  source         AppointmentSource @default(WALK_IN) // 預約來源
  note           String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  // 關聯
  clinic         Clinic          @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  patient        Patient         @relation(fields: [patientId], references: [id], onDelete: Cascade)
  doctor         Doctor?         @relation(fields: [doctorId], references: [id])
  room           Room?           @relation(fields: [roomId], references: [id])
  
  @@index([clinicId, status])
  @@index([clinicId, appointmentTime])
  @@index([patientId, status])
}

model ActivityLog {
  id             String          @id @default(cuid())
  clinicId       String
  userId         String
  action         String
  resource       String
  resourceId     String?
  details        Json?
  ipAddress      String?
  userAgent      String?
  createdAt      DateTime        @default(now())
  
  // 關聯
  clinic         Clinic          @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([clinicId, createdAt])
  @@index([userId, createdAt])
}

enum Role {
  ADMIN          // 系統管理員
  CLINIC_ADMIN   // 診所管理員
  DOCTOR         // 醫生
  NURSE          // 護士
  STAFF          // 一般職員
  RECEPTIONIST   // 前台接待
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum RoomStatus {
  OPEN           // 開診中
  PAUSED         // 暫停看診
  CLOSED         // 關診
}

enum AppointmentStatus {
  SCHEDULED      // 已預約
  CHECKED_IN     // 已報到
  IN_PROGRESS    // 看診中
  COMPLETED      // 已完成
  CANCELLED      // 已取消
  NO_SHOW        // 未到診
}

enum AppointmentSource {
  WALK_IN        // 現場掛號
  PHONE          // 電話預約
  ONLINE         // 線上預約
  LINE           // LINE預約
  APP            // APP預約
}
```

## 後端 Clean Architecture 架構設計

### 架構概念

本系統採用 Clean Architecture (整潔架構) 進行設計，將應用程式按層級分離而非按業務領域分組。這種設計確保了架構邊界清晰，讓系統更加關注於層級之間的依賴關係。

整個應用程式分為四個主要層級：

1. **Domain 層** - 業務核心，包含業務實體、規則和介面定義
2. **Use Cases 層** - 應用程式特定業務邏輯，協調領域實體
3. **Presentation 層** - 處理外部輸入和輸出，如 API 控制器、MQTT 等
4. **Infrastructure 層** - 實現技術細節，如資料庫存取、外部服務等

### 層級架構與職責

#### Domain 層

Domain 層是整個系統的核心，包含業務實體、值物件、領域事件和業務規則。這一層是獨立的，不依賴於任何外部框架或技術細節。

**資料夾結構**:
```
src/
└── domain/
    ├── common/                     # 通用領域元素
    │   ├── entities/               # 基礎實體類
    │   ├── value-objects/          # 值物件
    │   └── interfaces/             # 通用介面
    │
    ├── appointments/               # 預約領域
    │   ├── entities/               # 預約實體
    │   ├── value-objects/          # 預約相關值物件
    │   ├── events/                 # 領域事件
    │   ├── interfaces/             # 領域介面，如儲存庫介面
    │   └── exceptions/             # 領域例外
    │
    ├── clinics/                    # 診所領域
    ├── patients/                   # 病患領域
    ├── doctors/                    # 醫生領域
    ├── rooms/                      # 診間領域
    └── users/                      # 使用者領域
```

**主要職責**:
- 定義業務實體與值物件
- 定義業務規則與驗證邏輯
- 定義領域事件
- 定義領域服務介面
- 不依賴任何框架或外部技術

#### Use Cases 層

Use Cases 層包含應用程式的特定業務邏輯，協調領域實體完成特定的業務流程。此層實現了系統的功能需求。

**資料夾結構**:
```
src/
└── usecases/
    ├── common/                     # 通用使用案例元素
    │   ├── interfaces/             # 使用案例介面
    │   └── base/                   # 基礎使用案例類
    │
    ├── appointments/               # 預約使用案例
    │   ├── commands/               # 命令處理
    │   │   ├── create-appointment/ # 建立預約命令
    │   │   ├── update-appointment/ # 更新預約命令
    │   │   └── cancel-appointment/ # 取消預約命令
    │   │
    │   └── queries/                # 查詢處理
    │       ├── get-appointments/   # 取得預約列表查詢
    │       └── get-appointment/    # 取得單一預約查詢
    │
    ├── clinics/                    # 診所使用案例
    ├── patients/                   # 病患使用案例
    ├── doctors/                    # 醫生使用案例
    ├── rooms/                      # 診間使用案例
    └── users/                      # 使用者使用案例
```

**主要職責**:
- 實現應用程式的業務邏輯
- 協調領域實體完成特定業務流程
- 執行輸入驗證和業務規則檢查
- 處理領域事件
- 只依賴領域層，不依賴外部技術

#### Presentation 層

Presentation 層負責處理用戶輸入和輸出，提供系統的對外介面。這一層包含 REST API 控制器、MQTT 網關等與外部系統的通訊介面。

**資料夾結構**:
```
src/
└── presentation/
    ├── common/                     # 通用表示層元素
    │   ├── base.controller.ts      # 基礎控制器
    │   ├── filters/                # 異常過濾器
    │   ├── interceptors/           # 攔截器
    │   └── decorators/             # 自定義裝飾器
    │
    ├── rest/                       # REST API 控制器
    │   ├── appointments/           # 預約相關 API
    │   ├── clinics/                # 診所相關 API
    │   ├── patients/               # 病患相關 API
    │   ├── doctors/                # 醫生相關 API
    │   ├── rooms/                  # 診間相關 API
    │   └── users/                  # 使用者相關 API
    │
    └── mqtt/                       # MQTT 網關
        ├── common/                 # 通用 MQTT 元素
        ├── appointments/           # 預約相關 MQTT 網關
        ├── rooms/                  # 診間相關 MQTT 網關
        └── notifications/          # 通知相關 MQTT 網關
```

**主要職責**:
- 處理HTTP請求和回應
- 處理MQTT消息發送和接收
- 進行請求參數驗證
- 將請求轉換為使用案例命令或查詢
- 將領域資料轉換為 API 回應格式

#### Infrastructure 層

Infrastructure 層實現與外部系統和框架的整合，包括資料庫存取、外部服務整合、認證服務等。

**資料夾結構**:
```
src/
└── infrastructure/
    ├── common/                     # 通用基礎設施元素
    │   ├── database/               # 資料庫相關
    │   │   └── prisma/             # Prisma ORM 設定
    │   ├── services/               # 共用服務
    │   └── adapters/               # 外部服務適配器
    │
    ├── auth/                       # 認證相關
    │   ├── services/               # 認證服務
    │   ├── guards/                 # 認證守衛
    │   ├── strategies/             # 認證策略
    │   └── decorators/             # 認證裝飾器
    │
    ├── repositories/               # 資料庫存取實現
    │   ├── appointments/           # 預約儲存庫
    │   ├── clinics/                # 診所儲存庫
    │   ├── patients/               # 病患儲存庫
    │   ├── doctors/                # 醫生儲存庫
    │   ├── rooms/                  # 診間儲存庫
    │   └── users/                  # 使用者儲存庫
    │
    ├── mappers/                    # 資料映射器
    │   ├── appointment.mapper.ts
    │   ├── clinic.mapper.ts
    │   └── ...
    │
    └── external-services/          # 外部服務整合
        ├── notification/           # 通知服務
        └── firebase/               # Firebase 服務
```

**主要職責**:
- 實現儲存庫介面
- 提供資料庫存取功能
- 整合外部服務和 API
- 處理技術細節和框架整合
- 提供基礎設施服務，如日誌記錄、事件發佈等

### 應用程式模組

為了按功能組織 NestJS 模組，我們在根目錄下設立 `app` 資料夾，包含各個功能模組的定義。

**資料夾結構**:
```
src/
└── app/
    ├── appointments/               # 預約模組
    │   └── appointments.module.ts
    ├── clinics/                    # 診所模組
    ├── patients/                   # 病患模組
    ├── doctors/                    # 醫生模組
    ├── rooms/                      # 診間模組
    └── users/                      # 使用者模組
```

### 依賴規則

Clean Architecture 的核心原則是依賴規則，外層可以依賴內層，但內層不能依賴外層：

1. **Domain 層** 不依賴任何其他層
2. **Use Cases 層** 只依賴 Domain 層
3. **Presentation 層** 依賴 Use Cases 層和 Domain 層
4. **Infrastructure 層** 依賴 Domain 層，實現 Domain 層定義的介面

### 資料流動

在 Clean Architecture 中，資料的流動遵循以下模式：

1. 外部請求 → Presentation 層控制器
2. 控制器將請求轉換為 Use Case 命令/查詢
3. Use Case 執行業務邏輯，透過儲存庫介面存取數據
4. Infrastructure 層實現儲存庫介面，與資料庫交互
5. 資料按相反方向返回：資料庫 → 儲存庫 → Use Case → 控制器 → 回應

### 依賴注入

使用 NestJS 的依賴注入系統來實現控制反轉原則：

```typescript
// 在模組中配置依賴注入
@Module({
  providers: [
    // Use Cases
    CreateAppointmentHandler,
    GetAppointmentsHandler,
    
    // 將 Infrastructure 層實現注入到 Domain 層介面
    {
      provide: 'IAppointmentRepository',
      useClass: PrismaAppointmentRepository,
    },
    
    // 映射器
    AppointmentMapper,
    
    // 其他服務
    PrismaService,
  ],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
```

### 模組間通訊

使用 NestJS 的事件系統（基於 CQRS 模式）進行模組間的解耦通訊：

1. 領域事件由 Domain 層定義
2. Use Cases 層發佈事件
3. 其他 Use Cases 可以訂閱並處理這些事件

## 前端實作架構 (React + TypeScript)

### 資料夾結構

```
src/
├── main.tsx                        # 應用入口點
├── App.tsx                         # 主應用元件
├── assets/                         # 靜態資源
├── components/                     # 共用元件
│   ├── ui/                         # UI 元件 (shadcn/ui)
│   ├── layout/                     # 布局元件
│   ├── form/                       # 表單元件
│   └── data-display/               # 資料展示元件
├── context/                        # React Context
│   ├── auth-context.tsx            # 認證上下文
│   └── clinic-context.tsx          # 診所上下文
├── features/                       # 功能模組
│   ├── auth/                       # 認證功能
│   ├── dashboard/                  # 儀表板
│   ├── patients/                   # 病患管理
│   ├── appointments/               # 預約管理
│   ├── doctors/                    # 醫生管理
│   ├── rooms/                      # 診間管理
│   └── settings/                   # 系統設定
├── hooks/                          # 自定義 Hooks
│   ├── use-auth.ts                 # 認證 Hook
│   ├── use-clinic.ts               # 診所 Hook
│   ├── use-mqtt.ts                 # mqtt Hook
│   └── use-permission.ts           # 權限檢查 Hook
├── lib/                            # 工具庫
│   ├── api.ts                      # API 客戶端
│   ├── mqtt.ts                     # MQTT 客戶端
│   ├── utils.ts                    # 工具函數
│   └── validators.ts               # 表單驗證
├── routes/                         # 路由設定
│   └── index.tsx                   # 路由定義
├── services/                       # 服務層
│   ├── auth-service.ts             # 認證服務
│   ├── patient-service.ts          # 病患服務
│   └── appointment-service.ts      # 預約服務
├── store/                          # 狀態管理
│   └── queries/                    # React Query
├── types/                          # TypeScript 型別定義
│   ├── auth.types.ts               # 認證相關型別
│   ├── clinic.types.ts             # 診所相關型別
│   └── api.types.ts                # API 相關型別
└── utils/                          # 工具函數
    ├── date-utils.ts               # 日期處理
    ├── format-utils.ts             # 格式化工具
    └── permission-utils.ts         # 權限相關工具
```

## 身分驗證架構

### 認證流程
1. **多平台登入整合**：使用 Firebase Authentication 支援多種登入方式（Google、Facebook、Email/密碼、手機驗證）
2. **身分驗證流程**：
   - 前端通過 Firebase 完成身分驗證，獲取 Firebase ID token
   - 將 Firebase token 發送至後端
   - 後端使用 Firebase Admin SDK 驗證 token 真實性
   - 驗證成功後，系統生成內部 JWT token 並返回給前端
   - 後續請求使用內部 JWT 進行身分驗證

### 技術實現
- **前端**：Firebase Authentication SDK
- **後端**：
  - Firebase Admin SDK 驗證外部身分
  - NestJS JWT Guard 處理內部身分驗證
  - Custom Auth Guards 處理權限控制

### 未來擴展計劃
- 當用戶數增長時，計劃將身分驗證服務遷移至 Supabase
- 遷移策略將確保向後兼容，用戶無感知切換

## 資料庫架構與存取策略

### 主要資料庫
- **PostgreSQL**：作為唯一的持久化儲存

### 資料庫存取層
- **Prisma ORM**：作為唯一的資料庫存取層，處理所有資料庫操作
- **Repository 模式**：實現領域與資料存取的解耦
  - 定義抽象的 Repository 介面
  - 使用 Prisma 實現具體的 Repository

### Firebase/Supabase 與資料層的關係
- **僅用於身分驗證**：Firebase/Supabase 僅作為身分提供者
- **用戶資料同步**：Firebase 認證成功後，用戶基本資訊同步至 PostgreSQL
- **資料隔離**：認證服務與業務資料完全分離，確保系統靈活性

## 即時通訊功能

系統使用 MQTT 提供即時更新:

- **候診隊列更新**：病患候診狀態即時推送
- **診間狀態變更**：診間開/關診狀態即時更新
- **到診提醒**：病患到診時通知櫃檯和醫生
- **跨裝置支援**：網頁前端、Flutter行動應用程式和ESP32顯示看板
- **主題結構**：使用`cms/clinic/{clinic_id}/...`結構確保資料隔離

### MQTT 與 Socket 的使用場景
- **MQTT**：用於廣播性質的實時消息，如候診隊列更新、診間狀態變更
- **WebSocket** (未實現)：保留未來用於點對點通訊功能的可能性

## 多診所管理架構

- **使用者可屬於多家診所**：一個使用者可以在不同診所擔任不同角色
- **診所上下文**：所有操作都在特定診所上下文中進行
- **資料隔離**：不同診所的資料完全隔離

## 測試策略與實踐

### TDD 開發流程
1. **紅階段**：先編寫失敗的測試，明確需求
2. **綠階段**：實現最小可行代碼，使測試通過
3. **重構階段**：改進代碼質量，確保測試仍然通過

### 測試分層策略
- **單元測試**：
  - 覆蓋率目標：90%+ 的業務邏輯代碼
  - 主要工具：Jest
  - 重點測試：Domain 和 Usecase 層
  - 獨立測試：使用 Mock 和 Stub 隔離外部依賴

- **整合測試**：
  - 覆蓋率目標：80%+ 的關鍵流程
  - 測試範圍：Repository 實現、外部服務整合
  - 測試策略：使用 TestContainer 提供隔離的測試環境

- **端到端測試**：
  - 覆蓋關鍵業務流程
  - 工具：Cypress (前端)、Supertest (API)
  - 自動化運行：CI/CD 流程的一部分

### 測試檔案結構
- 測試文件與源文件位置平行
- 單元測試：`*.spec.ts`
- 整合測試：`*.integration.spec.ts`
- 端到端測試：`*.e2e.spec.ts`

### 持續集成
- 每次 PR 自動運行單元和整合測試
- 主分支合併前運行完整測試套件
- 測試報告和覆蓋率報告自動生成

### 測試最佳實踐
- 使用工廠模式創建測試對象
- 採用 Given-When-Then 風格編寫測試
- 建立共享的測試工具和 Fixtures
- 定期進行測試代碼審查

## 系統性能與擴展性考量

### 性能優化策略
- **資料庫查詢優化**：
  - 適當索引設計（參見 Prisma Schema 中的 @@index 定義）
  - 複雜查詢分析與優化
  - 使用 Prisma 的查詢合併功能減少數據庫往返

- **緩存策略**：
  - Redis 用於緩存頻繁訪問的數據（候診隊列、醫生排班）
  - 實現多級緩存：Memory Cache → Redis → Database
  - 緩存失效策略：基於時間和事件的混合策略

- **前端性能**：
  - 實現組件懶加載
  - 使用 React.memo 和 useMemo 減少不必要的重渲染
  - 使用虛擬滾動處理大量數據顯示

### 擴展性設計
- **水平擴展**：
  - 無狀態 API 服務設計，支持多實例部署
  - 使用 Kubernetes 進行容器編排和自動擴展
  - 資料庫讀寫分離準備

- **多租戶擴展**：
  - 基於 clinic_id 的邏輯隔離
  - 每租戶資源限制機制
  - 根據租戶使用情況自動調整資源分配

- **微服務準備**：
  - 模塊化設計便於未來拆分為微服務
  - 領域模型邊界清晰定義
  - 事件驅動架構為服務通信做準備

### 負載測試與監控
- **負載測試策略**：
  - 使用 k6 進行 API 壓力測試
  - 模擬高峰期場景的性能測試
  - 定期執行基準測試並記錄性能指標

- **監控體系**：
  - Prometheus 收集系統和應用指標
  - Grafana 儀表板可視化性能數據
  - ELK Stack 集中日誌管理與分析
  - 設置關鍵指標警報機制

### 故障恢復
- **數據備份策略**：
  - PostgreSQL 定時全量和增量備份
  - 跨區域備份存儲
  - 定期恢復測試演練

- **高可用設計**：
  - 關鍵服務多實例部署
  - MQTT Broker 集群配置
  - Redis 哨兵模式或叢集模式

## 部署工作流程與環境配置

### 環境定義
- **開發環境 (DEV)**：
  - 開發人員本地環境，使用 Docker Compose 啟動所有依賴
  - 使用本地數據庫或共享開發數據庫
  - 自動應用數據庫遷移

- **測試環境 (QA)**：
  - 自動化測試和手動測試環境
  - 定期重置數據
  - 模擬生產環境配置

- **預發布環境 (STAGING)**：
  - 與生產環境配置相同
  - 用於最終驗證和壓力測試
  - 生產數據子集或匿名化數據

- **生產環境 (PROD)**：
  - 高可用性配置
  - 嚴格的變更控制
  - 自動擴展能力

### CI/CD 流程
1. **代碼提交階段**：
   - 提交前 Lint 和格式檢查
   - 提交後自動運行單元測試

2. **合併請求階段**：
   - 自動部署到開發環境
   - 運行整合測試和端到端測試
   - 自動生成測試覆蓋率報告

3. **合併主分支後**：
   - 自動部署到測試環境
   - 運行完整測試套件
   - 生成部署包

4. **發布階段**：
   - 手動批准部署到預發佈環境
   - 自動化冒煙測試
   - 手動批准部署到生產環境
   - 分批滾動部署

### 環境變數管理
- 使用 HashiCorp Vault 或 AWS Secrets Manager 管理機密
- 環境變數模板文件納入版本控制
- 敏感值通過 CI/CD 系統注入

### 部署監控和回滾
- 部署進度儀表板
- 自動化部署健康檢查
- 一鍵式回滾機制
- 部署後自動化測試

## API端點文件

### 身分驗證API

- `POST /api/auth/register` - 註冊新使用者及診所
- `POST /api/auth/login` - 使用者登入
- `POST /api/auth/logout` - 使用者登出
- `GET /api/auth/user` - 取得目前使用者資訊
- `POST /api/auth/select-clinic` - 選擇目前操作診所

### 病患API

- `GET /api/patients` - 取得病患列表
- `POST /api/patients` - 建立新病患
- `GET /api/patients/:id` - 取得特定病患
- `PUT /api/patients/:id` - 更新病患資訊
- `DELETE /api/patients/:id` - 刪除病患

### 預約API

- `GET /api/appointments` - 取得預約列表
- `POST /api/appointments` - 建立新預約
- `GET /api/appointments/:id` - 取得特定預約
- `PUT /api/appointments/:id` - 更新預約狀態
- `DELETE /api/appointments/:id` - 刪除預約

### MQTT API

- **Broker連接**: `mqtt://broker:1883` 或 `wss://broker:8084/mqtt`
- **主題結構**:
  - `cms/clinic/{clinic_id}/queue/updates`: 候診隊列更新
  - `cms/clinic/{clinic_id}/room/{room_id}/status`: 診間狀態變更
  - `cms/clinic/{clinic_id}/notifications`: 系統通知
  - `cms/patient/{patient_id}/notifications`: 病患專屬通知

## 多平台支援

系統支援多種前端平台:

- **Web前端**: React + TypeScript，適用於診所人員操作
- **Flutter應用**: 提供病患使用的行動應用程式，包含掛號、看診進度和提醒功能
- **ESP32看板**: 顯示候診列表的資訊看板，適用於診所現場展示

## 技術支援和貢獻

如有任何問題或建議，請透過GitHub Issues提交。我們歡迎所有形式的貢獻，包括功能請求、錯誤回報和程式碼貢獻。

## 授權條款

MIT
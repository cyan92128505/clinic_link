# 診所管理系統後端

這是一個使用 NestJS、Prisma、PostgreSQL 構建的診所管理系統後端 API。

## 技術架構

- **框架**：NestJS + TypeScript
- **資料庫**：PostgreSQL
- **ORM**：Prisma
- **認證**：JWT + Firebase Auth
- **即時通訊**：MQTT
- **快取**：Redis
- **API 文件**：Swagger/OpenAPI
- **架構模式**：Clean Architecture

## 系統需求

- Node.js 18+
- Docker 和 Docker Compose
- PostgreSQL 14+

## 快速開始

### 使用 Docker 開發環境

1. 啟動開發環境：

```bash
docker-compose -f docker-compose.dev.yml up -d
```

這將啟動 PostgreSQL、Redis、MQTT Broker 和 pgAdmin。

2. 複製環境變數範本：

```bash
cp .env.example .env
```

3. 安裝依賴：

```bash
npm install
```

4. 生成 Prisma 客戶端：

```bash
npm run prisma:generate
```

5. 執行資料庫遷移：

```bash
npm run prisma:migrate
```

6. 啟動開發伺服器：

```bash
npm run start:dev
```

應用程式將在 <http://localhost:3000> 上執行。

### Swagger API 文件

API 文件可以在 <http://localhost:3000/docs> 瀏覽。

## 資料庫管理

- pgAdmin 可以在 <http://localhost:5050> 瀏覽
  - 使用者: admin@example.com
  - 密碼: admin

## 架構說明

本系統採用 Clean Architecture，分為四個主要層級：

1. **Domain 層** - 業務核心，包含業務實體、規則和介面定義
2. **Use Cases 層** - 應用程式特定業務邏輯，協調領域實體
3. **Presentation 層** - 處理外部輸入和輸出，如 API 控制器、MQTT 等
4. **Infrastructure 層** - 實現技術細節，如資料庫存取、外部服務等

## 開發指南

### 生成新模組

```bash
nest g module app/module-name
```

### 生成新控制器

```bash
nest g controller presentation/rest/module-name
```

### 生成新服務

```bash
nest g service infrastructure/services/service-name
```

### 執行測試

```bash
# 單元測試
npm run test

# e2e 測試
npm run test:e2e

# 測試覆蓋率
npm run test:cov
```

## MQTT 主題

系統使用以下 MQTT 主題結構：

- `cms/clinic/{clinic_id}/queue/updates` - 候診隊列更新
- `cms/clinic/{clinic_id}/room/{room_id}/status` - 診間狀態變更
- `cms/clinic/{clinic_id}/notifications` - 系統通知
- `cms/patient/{patient_id}/notifications` - 病患專屬通知

## 授權條款

MIT
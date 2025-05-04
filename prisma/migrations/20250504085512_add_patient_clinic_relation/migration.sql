/*
  Warnings:

  - You are about to drop the column `clinicId` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `medicalHistory` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Patient` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[firebaseUid]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nationalId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_clinicId_fkey";

-- DropIndex
DROP INDEX "Patient_clinicId_name_idx";

-- DropIndex
DROP INDEX "Patient_clinicId_nationalId_key";

-- DropIndex
DROP INDEX "Patient_clinicId_phone_idx";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "clinicId",
DROP COLUMN "medicalHistory",
DROP COLUMN "note",
ADD COLUMN     "firebaseUid" TEXT;

-- CreateTable
CREATE TABLE "PatientClinic" (
    "patientId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientNumber" TEXT,
    "medicalHistory" JSONB,
    "note" TEXT,
    "firstVisitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientClinic_pkey" PRIMARY KEY ("patientId","clinicId")
);

-- CreateIndex
CREATE INDEX "PatientClinic_clinicId_isActive_idx" ON "PatientClinic"("clinicId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PatientClinic_clinicId_patientNumber_key" ON "PatientClinic"("clinicId", "patientNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_firebaseUid_key" ON "Patient"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_nationalId_key" ON "Patient"("nationalId");

-- CreateIndex
CREATE INDEX "Patient_firebaseUid_idx" ON "Patient"("firebaseUid");

-- CreateIndex
CREATE INDEX "Patient_nationalId_idx" ON "Patient"("nationalId");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Patient_name_idx" ON "Patient"("name");

-- AddForeignKey
ALTER TABLE "PatientClinic" ADD CONSTRAINT "PatientClinic_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientClinic" ADD CONSTRAINT "PatientClinic_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import { z } from "zod";

// Appointment status enum
export const appointmentStatusEnum = z.enum([
  "SCHEDULED", // Future appointment
  "CHECKED_IN", // Patient has arrived but is waiting
  "IN_PROGRESS", // Currently being seen
  "COMPLETED", // Appointment is done
  "CANCELLED", // Appointment was cancelled
  "NO_SHOW", // Patient didn't show up
]);

export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>;

// Appointment source enum (renamed from "type" to match Prisma schema)
export const appointmentSourceEnum = z.enum([
  "WALK_IN", // In-person registration
  "PHONE", // Phone reservation
  "ONLINE", // Online reservation
  "LINE", // LINE app reservation
  "APP", // Mobile app reservation
]);

export type AppointmentSource = z.infer<typeof appointmentSourceEnum>;

// Gender enum
export const genderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

export type Gender = z.infer<typeof genderEnum>;

// Role enum
export const roleEnum = z.enum([
  "ADMIN", // System administrator
  "CLINIC_ADMIN", // Clinic administrator
  "DOCTOR", // Doctor
  "NURSE", // Nurse
  "STAFF", // General staff
  "RECEPTIONIST", // Front desk receptionist
]);

export type Role = z.infer<typeof roleEnum>;

// Room status enum
export const roomStatusEnum = z.enum([
  "OPEN", // Room is open for appointments
  "PAUSED", // Temporarily paused
  "CLOSED", // Room is closed
]);

export type RoomStatus = z.infer<typeof roomStatusEnum>;

// Types for use in application
export interface Clinic {
  id: string; // Changed to string to match cuid() in Prisma
  name: string;
  address: string;
  phone: string;
  email?: string;
  logo?: string;
  settings?: Record<string, any>; // JSON object instead of string
  createdAt: Date;
  updatedAt: Date;
}

export interface UserClinic {
  userId: string;
  clinicId: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  password: string; // Note: This should never be exposed to the frontend
  name: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  clinics?: UserClinic[]; // User can belong to multiple clinics
}

export interface Patient {
  id: string;
  clinicId: string;
  nationalId?: string;
  name: string;
  birthDate?: Date;
  gender?: Gender;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: Record<string, any>; // JSON object
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  color?: string; // For frontend display
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  clinicId: string;
  departmentId: string;
  userId?: string; // If doctor is also a system user
  name: string;
  title?: string;
  specialty?: string;
  licenseNumber?: string;
  bio?: string;
  avatar?: string;
  scheduleData?: Record<string, any>; // JSON object
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  status: RoomStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorRoom {
  doctorId: string;
  roomId: string;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId?: string;
  roomId?: string;
  appointmentNumber?: number; // Optional number (A-15, B-08 format would be handled by UI)
  appointmentTime?: Date; // Scheduled time
  checkinTime?: Date; // When patient checked in
  startTime?: Date; // When appointment started
  endTime?: Date; // When appointment ended
  status: AppointmentStatus;
  source: AppointmentSource; // Renamed from "type"
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  clinicId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>; // JSON object
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Form schemas for validation
export const clinicSchema = z.object({
  name: z.string().min(1, "名稱為必填欄位"),
  address: z.string().min(1, "地址為必填欄位"),
  phone: z.string().min(1, "電話為必填欄位"),
  email: z.string().email("請輸入有效的電子郵件").optional().or(z.literal("")),
  logo: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

export const userSchema = z.object({
  email: z.string().email("請輸入有效的電子郵件"),
  password: z.string().min(8, "密碼至少需要8個字元"),
  name: z.string().min(1, "姓名為必填欄位"),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const userClinicSchema = z.object({
  userId: z.string(),
  clinicId: z.string(),
  role: roleEnum,
});

export const patientSchema = z.object({
  clinicId: z.string(),
  nationalId: z.string().optional(),
  name: z.string().min(1, "姓名為必填欄位"),
  birthDate: z.date().optional(),
  gender: genderEnum.optional(),
  phone: z.string().min(1, "電話為必填欄位"),
  email: z.string().email("請輸入有效的電子郵件").optional().or(z.literal("")),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalHistory: z.record(z.any()).optional(),
  note: z.string().optional(),
});

export const departmentSchema = z.object({
  clinicId: z.string(),
  name: z.string().min(1, "部門名稱為必填欄位"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const doctorSchema = z.object({
  clinicId: z.string(),
  departmentId: z.string(),
  userId: z.string().optional(),
  name: z.string().min(1, "醫師姓名為必填欄位"),
  title: z.string().optional(),
  specialty: z.string().optional(),
  licenseNumber: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  scheduleData: z.record(z.any()).optional(),
});

export const roomSchema = z.object({
  clinicId: z.string(),
  name: z.string().min(1, "診間名稱為必填欄位"),
  description: z.string().optional(),
  status: roomStatusEnum.default("CLOSED"),
});

export const doctorRoomSchema = z.object({
  doctorId: z.string(),
  roomId: z.string(),
});

export const appointmentSchema = z.object({
  clinicId: z.string(),
  patientId: z.string(),
  doctorId: z.string().optional(),
  roomId: z.string().optional(),
  appointmentNumber: z.number().optional(),
  appointmentTime: z.date().optional(),
  checkinTime: z.date().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  status: appointmentStatusEnum.default("SCHEDULED"),
  source: appointmentSourceEnum.default("WALK_IN"),
  note: z.string().optional(),
});

export const activityLogSchema = z.object({
  clinicId: z.string(),
  userId: z.string(),
  action: z.string().min(1, "動作類型為必填欄位"),
  resource: z.string().min(1, "資源類型為必填欄位"),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// Type definitions for form inputs
export type ClinicFormValues = z.infer<typeof clinicSchema>;
export type UserFormValues = z.infer<typeof userSchema>;
export type UserClinicFormValues = z.infer<typeof userClinicSchema>;
export type PatientFormValues = z.infer<typeof patientSchema>;
export type DepartmentFormValues = z.infer<typeof departmentSchema>;
export type DoctorFormValues = z.infer<typeof doctorSchema>;
export type RoomFormValues = z.infer<typeof roomSchema>;
export type DoctorRoomFormValues = z.infer<typeof doctorRoomSchema>;
export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
export type ActivityLogFormValues = z.infer<typeof activityLogSchema>;

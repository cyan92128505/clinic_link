import { pgTable, pgEnum, text, integer, boolean, timestamp, jsonb, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const roleEnum = pgEnum('role', [
  'ADMIN',
  'CLINIC_ADMIN',
  'DOCTOR',
  'NURSE',
  'STAFF',
  'RECEPTIONIST',
]);

export const genderEnum = pgEnum('gender', [
  'MALE',
  'FEMALE',
  'OTHER',
]);

export const roomStatusEnum = pgEnum('room_status', [
  'OPEN',
  'PAUSED',
  'CLOSED',
]);

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'SCHEDULED',
  'CHECKED_IN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export const appointmentSourceEnum = pgEnum('appointment_source', [
  'WALK_IN',
  'PHONE',
  'ONLINE',
  'LINE',
  'APP',
]);

export const clinics = pgTable('clinics', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  logo: text('logo'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
  };
});

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  avatar: text('avatar'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
  };
});

export const userClinics = pgTable('user_clinics', {
  userId: text('user_id').notNull(),
  clinicId: text('clinic_id').notNull(),
  role: roleEnum('role').notNull().default('STAFF'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    idx0: index().on(table.userId, table.clinicId),
  };
});

export const patients = pgTable('patients', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  clinicId: text('clinic_id').notNull(),
  nationalId: text('national_id'),
  name: text('name').notNull(),
  birthDate: timestamp('birth_date', { withTimezone: true }),
  gender: genderEnum('gender'),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  medicalHistory: jsonb('medical_history'),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    unique0: unique().on(table.clinicId, table.nationalId),
    idx1: index().on(table.clinicId, table.phone),
    idx2: index().on(table.clinicId, table.name),
  };
});

export const departments = pgTable('departments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  clinicId: text('clinic_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    unique0: unique().on(table.clinicId, table.name),
  };
});

export const doctors = pgTable('doctors', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  clinicId: text('clinic_id').notNull(),
  departmentId: text('department_id').notNull(),
  userId: text('user_id'),
  name: text('name').notNull(),
  title: text('title'),
  specialty: text('specialty'),
  licenseNumber: text('license_number'),
  bio: text('bio'),
  avatar: text('avatar'),
  scheduleData: jsonb('schedule_data'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    idx0: index().on(table.clinicId, table.name),
  };
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  clinicId: text('clinic_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: roomStatusEnum('status').notNull().default('CLOSED'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    unique0: unique().on(table.clinicId, table.name),
  };
});

export const doctorRooms = pgTable('doctor_rooms', {
  doctorId: text('doctor_id').notNull(),
  roomId: text('room_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    idx0: index().on(table.doctorId, table.roomId),
  };
});

export const appointments = pgTable('appointments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  clinicId: text('clinic_id').notNull(),
  patientId: text('patient_id').notNull(),
  doctorId: text('doctor_id'),
  roomId: text('room_id'),
  appointmentNumber: integer('appointment_number'),
  appointmentTime: timestamp('appointment_time', { withTimezone: true }),
  checkinTime: timestamp('checkin_time', { withTimezone: true }),
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  status: appointmentStatusEnum('status').notNull().default('SCHEDULED'),
  source: appointmentSourceEnum('source').notNull().default('WALK_IN'),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    unique0: unique().on(table.id, table.clinicId),
    idx1: index().on(table.clinicId, table.status),
    idx2: index().on(table.clinicId, table.appointmentTime),
    idx3: index().on(table.patientId, table.status),
  };
});

export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  clinicId: text('clinic_id').notNull(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  resourceId: text('resource_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    idx0: index().on(table.clinicId, table.createdAt),
    idx1: index().on(table.userId, table.createdAt),
  };
});

export const clinicsRelations = relations(clinics, ({ one, many }) => ({
  userClinicss: many(userClinics),
  patientss: many(patients),
  departmentss: many(departments),
  doctorss: many(doctors),
  roomss: many(rooms),
  appointmentss: many(appointments),
  activityLogss: many(activityLogs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  userClinicss: many(userClinics),
  activityLogss: many(activityLogs),
}));

export const userClinicsRelations = relations(userClinics, ({ one, many }) => ({
  users: one(users, {
    fields: [userClinics.userId],
    references: [users.id],
  }),
  clinics: one(clinics, {
    fields: [userClinics.clinicId],
    references: [clinics.id],
  }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  clinics: one(clinics, {
    fields: [patients.clinicId],
    references: [clinics.id],
  }),
  appointmentss: many(appointments),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  clinics: one(clinics, {
    fields: [departments.clinicId],
    references: [clinics.id],
  }),
  doctorss: many(doctors),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  clinics: one(clinics, {
    fields: [doctors.clinicId],
    references: [clinics.id],
  }),
  departments: one(departments, {
    fields: [doctors.departmentId],
    references: [departments.id],
  }),
  doctorRoomss: many(doctorRooms),
  appointmentss: many(appointments),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  clinics: one(clinics, {
    fields: [rooms.clinicId],
    references: [clinics.id],
  }),
  doctorRoomss: many(doctorRooms),
  appointmentss: many(appointments),
}));

export const doctorRoomsRelations = relations(doctorRooms, ({ one, many }) => ({
  doctors: one(doctors, {
    fields: [doctorRooms.doctorId],
    references: [doctors.id],
  }),
  rooms: one(rooms, {
    fields: [doctorRooms.roomId],
    references: [rooms.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  clinics: one(clinics, {
    fields: [appointments.clinicId],
    references: [clinics.id],
  }),
  patients: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctors: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
  rooms: one(rooms, {
    fields: [appointments.roomId],
    references: [rooms.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one, many }) => ({
  clinics: one(clinics, {
    fields: [activityLogs.clinicId],
    references: [clinics.id],
  }),
  users: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));


CREATE TYPE "public"."appointment_source" AS ENUM('WALK_IN', 'PHONE', 'ONLINE', 'LINE', 'APP');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'NURSE', 'STAFF', 'RECEPTIONIST');--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM('OPEN', 'PAUSED', 'CLOSED');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" text,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"doctor_id" text,
	"room_id" text,
	"appointment_number" integer,
	"appointment_time" timestamp with time zone,
	"checkin_time" timestamp with time zone,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"status" "appointment_status" DEFAULT 'SCHEDULED' NOT NULL,
	"source" "appointment_source" DEFAULT 'WALK_IN' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointments_id_clinic_id_unique" UNIQUE("id","clinic_id")
);
--> statement-breakpoint
CREATE TABLE "clinics" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"logo" text,
	"settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_clinic_id_name_unique" UNIQUE("clinic_id","name")
);
--> statement-breakpoint
CREATE TABLE "doctor_rooms" (
	"doctor_id" text NOT NULL,
	"room_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"department_id" text NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"title" text,
	"specialty" text,
	"license_number" text,
	"bio" text,
	"avatar" text,
	"schedule_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"national_id" text,
	"name" text NOT NULL,
	"birth_date" timestamp with time zone,
	"gender" "gender",
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"emergency_contact" text,
	"emergency_phone" text,
	"medical_history" jsonb,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patients_clinic_id_national_id_unique" UNIQUE("clinic_id","national_id")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"clinic_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "room_status" DEFAULT 'CLOSED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_clinic_id_name_unique" UNIQUE("clinic_id","name")
);
--> statement-breakpoint
CREATE TABLE "user_clinics" (
	"user_id" text NOT NULL,
	"clinic_id" text NOT NULL,
	"role" "role" DEFAULT 'STAFF' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"avatar" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "activity_logs_clinic_id_created_at_index" ON "activity_logs" USING btree ("clinic_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_logs_user_id_created_at_index" ON "activity_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "appointments_clinic_id_status_index" ON "appointments" USING btree ("clinic_id","status");--> statement-breakpoint
CREATE INDEX "appointments_clinic_id_appointment_time_index" ON "appointments" USING btree ("clinic_id","appointment_time");--> statement-breakpoint
CREATE INDEX "appointments_patient_id_status_index" ON "appointments" USING btree ("patient_id","status");--> statement-breakpoint
CREATE INDEX "doctor_rooms_doctor_id_room_id_index" ON "doctor_rooms" USING btree ("doctor_id","room_id");--> statement-breakpoint
CREATE INDEX "doctors_clinic_id_name_index" ON "doctors" USING btree ("clinic_id","name");--> statement-breakpoint
CREATE INDEX "patients_clinic_id_phone_index" ON "patients" USING btree ("clinic_id","phone");--> statement-breakpoint
CREATE INDEX "patients_clinic_id_name_index" ON "patients" USING btree ("clinic_id","name");--> statement-breakpoint
CREATE INDEX "user_clinics_user_id_clinic_id_index" ON "user_clinics" USING btree ("user_id","clinic_id");
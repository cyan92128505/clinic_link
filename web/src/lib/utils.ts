import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to locale string
export function formatDate(date: Date | string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return "--";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  
  return dateObj.toLocaleDateString("zh-TW", options || defaultOptions);
}

// Format time to locale string
export function formatTime(date: Date | string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return "--:--";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  
  return dateObj.toLocaleTimeString("zh-TW", options || defaultOptions);
}

// Format datetime to locale string
export function formatDateTime(date: Date | string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return "--";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  
  return dateObj.toLocaleString("zh-TW", options || defaultOptions);
}

// Generate a random appointment number
export function generateAppointmentNumber(type: "pre_booked" | "walk_in"): string {
  const prefix = type === "pre_booked" ? "A" : "B";
  const number = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  return `${prefix}-${number}`;
}

// Get status badge color and text
export function getStatusInfo(status: string): { color: string, text: string } {
  switch (status) {
    case "scheduled":
      return { color: "bg-primary-light/10 text-primary", text: "已預約" };
    case "checked_in":
      return { color: "bg-warning/10 text-warning", text: "等候中" };
    case "in_progress":
      return { color: "bg-success/10 text-success", text: "看診中" };
    case "completed":
      return { color: "bg-secondary/10 text-secondary", text: "已完成" };
    case "cancelled":
      return { color: "bg-destructive/10 text-destructive", text: "已取消" };
    case "no_show":
      return { color: "bg-neutral-200 text-neutral-700", text: "未到診" };
    default:
      return { color: "bg-neutral-100 text-neutral-500", text: status };
  }
}

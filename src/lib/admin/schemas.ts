import { z } from "zod";
import { LEAD_STATUSES } from "@/lib/admin/types";

export const leadCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  service_interest: z
    .enum([
      "end_of_tenancy",
      "move_in",
      "after_builders",
      "sparkle_handover",
      "deep_cleaning",
      "commercial",
      "airbnb",
      "carpet",
      "oven_appliance",
      "decluttering",
      "other",
    ])
    .optional(),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
  source: z.enum(["website", "referral", "call", "email", "other"]).optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  notes: z.string().trim().max(5000).optional().nullable(),
  quote_amount: z.coerce.number().nonnegative().optional().nullable(),
  lost_reason: z.string().trim().max(1000).optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  message: z.string().trim().max(5000).optional().nullable(),
});

export const leadConvertSchema = z.object({
  company_name: z.string().trim().max(200).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  postcode: z.string().trim().max(20).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  booking_date: z.string().optional().or(z.literal("")),
  start_time: z.string().optional().or(z.literal("")),
  price_quote: z.coerce.number().nonnegative().optional().nullable(),
});

export const clientCreateSchema = z.object({
  company_name: z.string().trim().max(200).optional().or(z.literal("")),
  contact_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  postcode: z.string().trim().max(20).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
});

export const bookingCreateSchema = z.object({
  client_id: z.string().uuid().optional().nullable().or(z.literal("")),
  lead_id: z.string().uuid().optional().nullable().or(z.literal("")),
  service_type: z
    .enum([
      "end_of_tenancy",
      "move_in",
      "after_builders",
      "sparkle_handover",
      "deep_cleaning",
      "commercial",
      "airbnb",
      "carpet",
      "oven_appliance",
      "decluttering",
      "other",
    ])
    .optional(),
  service_description: z.string().trim().max(2000).optional().or(z.literal("")),
  property_address: z.string().trim().max(500).optional().or(z.literal("")),
  property_postcode: z.string().trim().max(20).optional().or(z.literal("")),
  booking_date: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().optional().or(z.literal("")),
  crew_size: z.coerce.number().int().min(1).max(50).optional(),
  status: z
    .enum([
      "pending",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "rescheduled",
    ])
    .optional(),
  price_quote: z.coerce.number().nonnegative().optional().nullable(),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  assigned_team: z.array(z.string().uuid()).optional(),
});

export const bookingUpdateSchema = bookingCreateSchema.partial().extend({
  final_price: z.coerce.number().nonnegative().optional().nullable(),
  payment_status: z.enum(["unpaid", "deposit", "partial", "paid"]).optional(),
  deposit_paid: z.boolean().optional(),
  paid_in_full: z.boolean().optional(),
});

export const invoiceCreateSchema = z.object({
  client_id: z.string().uuid().optional().nullable().or(z.literal("")),
  booking_id: z.string().uuid().optional().nullable().or(z.literal("")),
  client_name: z.string().trim().min(2).max(200),
  client_email: z.string().trim().email().max(160).optional().or(z.literal("")),
  client_address: z.string().trim().max(500).optional().or(z.literal("")),
  amount: z.coerce.number().nonnegative(),
  vat_rate: z.coerce.number().min(0).max(100).optional(),
  issue_date: z.string().min(1),
  due_date: z.string().min(1),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export const invoiceUpdateSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  payment_method: z
    .enum(["bank_transfer", "card", "cash", "cheque"])
    .optional()
    .nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
  paid_at: z.string().optional().nullable(),
});

export const expenseCreateSchema = z.object({
  expense_date: z.string().min(1),
  category: z
    .enum([
      "equipment",
      "supplies",
      "transport",
      "salaries",
      "utilities",
      "rent",
      "marketing",
      "insurance",
      "training",
      "other",
    ])
    .optional(),
  description: z.string().trim().min(2).max(500),
  amount: z.coerce.number().nonnegative(),
  vendor: z.string().trim().max(200).optional().or(z.literal("")),
  project_id: z.string().uuid().optional().nullable().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const complaintCreateSchema = z.object({
  client_name: z.string().trim().min(2).max(120),
  client_email: z.string().trim().email().max(160),
  client_phone: z.string().trim().max(40).optional().or(z.literal("")),
  complaint_text: z.string().trim().min(5).max(5000),
  booking_id: z.string().uuid().optional().nullable().or(z.literal("")),
});

export const complaintUpdateSchema = z.object({
  status: z
    .enum(["new", "acknowledged", "investigating", "resolved", "closed"])
    .optional(),
  resolution_notes: z.string().trim().max(5000).optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(40).optional().nullable(),
  role: z
    .enum(["admin", "manager", "scheduler", "cleaner", "finance"])
    .optional(),
  is_active: z.boolean().optional(),
  job_title: z.string().trim().max(120).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
  hire_date: z.string().optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  emergency_contact: z.string().trim().max(200).optional().nullable(),
});

/** Self-service profile — cannot change role, status, or staff ID. */
export const selfProfileUpdateSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().nullable().or(z.literal("")),
  job_title: z.string().trim().max(120).optional().nullable().or(z.literal("")),
  address: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  emergency_contact: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z.string().trim().max(5000).optional().nullable().or(z.literal("")),
});

export const selfPasswordChangeSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required."),
    new_password: z.string().min(8).max(72),
    confirm_password: z.string().min(8).max(72),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New passwords do not match.",
    path: ["confirm_password"],
  });

export const staffCreateSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(72),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  role: z.enum(["admin", "manager", "scheduler", "cleaner", "finance"]),
  job_title: z.string().trim().max(120).optional().or(z.literal("")),
  hire_date: z.string().optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  emergency_contact: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export const settingsUpdateSchema = z.object({
  company_name: z.string().trim().min(2).max(200).optional(),
  trading_name: z.string().trim().max(200).optional().nullable().or(z.literal("")),
  email: z.string().trim().email().max(160).optional(),
  support_email: z
    .string()
    .trim()
    .email()
    .max(160)
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  website: z.string().trim().max(300).optional().nullable().or(z.literal("")),
  registered_address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .or(z.literal("")),
  company_number: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .or(z.literal("")),
  vat_number: z.string().trim().max(40).optional().nullable().or(z.literal("")),
  vat_rate: z.coerce.number().min(0).max(100).optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  timezone: z.string().trim().min(2).max(60).optional(),
  invoice_prefix: z.string().trim().min(1).max(20).optional(),
  staff_prefix: z.string().trim().min(1).max(20).optional(),
  invoice_footer: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable()
    .or(z.literal("")),
  data_retention_days: z.coerce.number().int().min(30).max(3650).optional(),
});

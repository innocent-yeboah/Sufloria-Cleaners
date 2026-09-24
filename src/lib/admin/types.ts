export type StaffRole = "admin" | "manager" | "scheduler" | "cleaner" | "finance";

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "closing",
  "booked",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadPriority = "low" | "normal" | "high";
export type ServiceInterest =
  | "end_of_tenancy"
  | "move_in"
  | "after_builders"
  | "sparkle_handover"
  | "deep_cleaning"
  | "commercial"
  | "airbnb"
  | "carpet"
  | "oven_appliance"
  | "decluttering"
  | "other";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rescheduled";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type ComplaintStatus =
  | "new"
  | "acknowledged"
  | "investigating"
  | "resolved"
  | "closed";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: StaffRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  staff_id: string | null;
  job_title: string | null;
  notes: string | null;
  hire_date: string | null;
  address: string | null;
  emergency_contact: string | null;
};

export const STAFF_ROLES: StaffRole[] = [
  "admin",
  "manager",
  "scheduler",
  "cleaner",
  "finance",
];

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  service_interest: ServiceInterest | null;
  property_size: string | null;
  property_type: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  assigned_to: string | null;
  notes: string | null;
  quote_amount: number | null;
  closing_at: string | null;
  contacted_at: string | null;
  quoted_at: string | null;
  booked_at: string | null;
  lost_reason: string | null;
  enquiry_type: string | null;
  client_type: string | null;
  postcode: string | null;
  preferred_date: string | null;
  photo_paths: string[] | null;
};

export type Client = {
  id: string;
  created_at: string;
  company_name: string | null;
  contact_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  postcode: string | null;
  city: string | null;
  country: string;
  notes: string | null;
  status: "active" | "inactive";
};

export type Booking = {
  id: string;
  created_at: string;
  client_id: string | null;
  lead_id: string | null;
  service_type: ServiceInterest | null;
  service_description: string | null;
  property_address: string | null;
  property_postcode: string | null;
  booking_date: string;
  start_time: string;
  end_time: string | null;
  crew_size: number;
  status: BookingStatus;
  price_quote: number | null;
  final_price: number | null;
  payment_status: string | null;
  notes: string | null;
  assigned_team: string[] | null;
  clients?: { contact_name: string; company_name: string | null } | null;
};

export type Invoice = {
  id: string;
  created_at: string;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  amount: number;
  vat_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
};

export type Complaint = {
  id: string;
  created_at: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  complaint_text: string;
  status: ComplaintStatus;
  booking_id: string | null;
  resolution_notes: string | null;
};

export const SERVICE_LABELS: Record<ServiceInterest, string> = {
  end_of_tenancy: "End of Tenancy Cleaning",
  move_in: "Residential Move-In Cleaning",
  after_builders: "After Builders Cleaning",
  sparkle_handover: "Sparkle & Handover Cleaning",
  deep_cleaning: "Deep Cleaning",
  commercial: "Commercial & Office Cleaning",
  airbnb: "Airbnb & Holiday Let Cleaning",
  carpet: "Carpet Cleaning",
  oven_appliance: "Oven & Appliance Cleaning",
  decluttering: "Decluttering & Hoarding Cleaning",
  other: "Other",
};

export const ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Admin",
  manager: "Manager",
  scheduler: "Scheduler",
  cleaner: "Cleaner",
  finance: "Finance",
};

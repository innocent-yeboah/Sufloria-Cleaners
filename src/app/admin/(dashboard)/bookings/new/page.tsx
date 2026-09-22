import Link from "next/link";
import BookingForm from "@/components/admin/BookingForm";
import { requireAdminSession } from "@/lib/admin/auth";
import type { Client, Profile } from "@/lib/admin/types";

export const metadata = { title: "New booking" };

export default async function AdminNewBookingPage() {
  const { supabase } = await requireAdminSession([
    "admin",
    "manager",
    "scheduler",
  ]);

  const [{ data: clients }, { data: staff }] = await Promise.all([
    supabase.from("clients").select("*").eq("status", "active").order("contact_name"),
    supabase.from("profiles").select("*").eq("is_active", true).order("full_name"),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/bookings" className="text-sm font-semibold text-teal">
          ← Back to bookings
        </Link>
        <h1 className="heading-lg mt-3">Create booking</h1>
      </div>
      <BookingForm
        clients={(clients || []) as Client[]}
        staff={(staff || []) as Profile[]}
      />
    </div>
  );
}

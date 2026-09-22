import Link from "next/link";
import { Plus } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import StaffCreateForm from "@/components/admin/StaffCreateForm";
import { requireAdminSession, formatUkDate } from "@/lib/admin/auth";
import { ROLE_LABELS, type Profile } from "@/lib/admin/types";

export const metadata = { title: "Staff" };

type SearchParams = { new?: string; q?: string; role?: string };

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase, profile } = await requireAdminSession([
    "admin",
    "manager",
  ]);

  let query = supabase.from("profiles").select("*").order("full_name");

  if (searchParams.role) {
    query = query.eq("role", searchParams.role);
  }
  if (searchParams.q) {
    const q = searchParams.q.trim();
    query = query.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,staff_id.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }

  const { data } = await query;
  const staff = (data || []) as Profile[];
  const isAdmin = profile.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">People</p>
          <h1 className="heading-lg">Staff directory</h1>
          <p className="mt-2 text-sm text-dark/70">
            Add and manage staff across all roles. Each person gets a staff ID
            and individual profile.
          </p>
        </div>
        {isAdmin ? (
          <Link
            href="/admin/staff?new=1"
            className="btn-navy inline-flex w-fit items-center gap-2"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add staff
          </Link>
        ) : null}
      </div>

      <form className="flex flex-col gap-3 rounded-2xl border border-navy/8 bg-white p-4 shadow-soft sm:flex-row">
        <input
          name="q"
          defaultValue={searchParams.q || ""}
          placeholder="Search name, email, staff ID"
          className="flex-1 rounded-xl border border-navy/15 px-3 py-2 text-sm"
        />
        <select
          name="role"
          defaultValue={searchParams.role || ""}
          className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-navy">
          Filter
        </button>
      </form>

      {searchParams.new === "1" && isAdmin ? <StaffCreateForm /> : null}

      <DataTable
        rowKey={(row) => row.id}
        rows={staff}
        columns={[
          {
            key: "staff_id",
            header: "Staff ID",
            cell: (row) => (
              <span className="font-mono text-xs font-semibold text-navy">
                {row.staff_id || "—"}
              </span>
            ),
          },
          {
            key: "name",
            header: "Name",
            cell: (row) => (
              <div>
                <Link
                  href={`/admin/staff/${row.id}`}
                  className="font-semibold text-navy hover:text-teal"
                >
                  {row.full_name}
                </Link>
                <p className="text-xs text-dark/60">{row.email}</p>
              </div>
            ),
          },
          {
            key: "role",
            header: "Role",
            cell: (row) => ROLE_LABELS[row.role],
          },
          {
            key: "title",
            header: "Job title",
            cell: (row) => row.job_title || "—",
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <StatusBadge value={row.is_active ? "active" : "inactive"} />
            ),
          },
          {
            key: "login",
            header: "Last login",
            cell: (row) => formatUkDate(row.last_login),
          },
        ]}
      />
    </div>
  );
}

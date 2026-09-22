import StatusBadge from "@/components/admin/StatusBadge";
import MyProfileForm from "@/components/admin/MyProfileForm";
import MyPasswordForm from "@/components/admin/MyPasswordForm";
import { requireAdminSession, formatUkDate } from "@/lib/admin/auth";
import { ROLE_LABELS } from "@/lib/admin/types";

export const metadata = { title: "My profile" };

export default async function AdminMyProfilePage() {
  const { profile } = await requireAdminSession();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="section-label">Account</p>
        <h1 className="heading-lg">My profile</h1>
        <p className="mt-2 text-sm text-dark/70">
          Manage your professional details and sign-in security.
        </p>
      </div>

      <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-teal">
              {profile.staff_id || "No staff ID"}
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy">
              {profile.full_name}
            </h2>
            <p className="mt-1 text-sm text-dark/70">{profile.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={profile.role} />
            <StatusBadge value={profile.is_active ? "active" : "inactive"} />
          </div>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-dark/60">Role</dt>
            <dd className="font-semibold text-navy">
              {ROLE_LABELS[profile.role]}
            </dd>
          </div>
          <div>
            <dt className="text-dark/60">Member since</dt>
            <dd className="font-semibold text-navy">
              {formatUkDate(profile.created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-dark/60">Last login</dt>
            <dd className="font-semibold text-navy">
              {formatUkDate(profile.last_login)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-dark/55">
          Role, staff ID, and account status are managed by company
          administrators and cannot be changed here.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <MyProfileForm profile={profile} />
        <MyPasswordForm />
      </div>
    </div>
  );
}

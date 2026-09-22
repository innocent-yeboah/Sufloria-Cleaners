import SettingsForm, {
  type CompanySettings,
} from "@/components/admin/SettingsForm";
import { requireAdminSession, formatUkDate } from "@/lib/admin/auth";

export const metadata = { title: "System settings" };

export default async function AdminSettingsPage() {
  const { supabase, profile } = await requireAdminSession([
    "admin",
    "manager",
    "finance",
  ]);

  const { data: settings } = await supabase
    .from("company_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  const row = settings as CompanySettings | null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="section-label">Configuration</p>
        <h1 className="heading-lg">System settings</h1>
        <p className="mt-2 text-sm text-dark/70">
          Company identity, finance defaults, staff numbering, and UK data
          retention policy.
        </p>
      </div>

      {!row ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Settings have not been initialised yet. Contact a system administrator.
        </p>
      ) : profile.role === "admin" ? (
        <>
          {row.updated_at ? (
            <p className="text-xs text-dark/55">
              Last updated {formatUkDate(row.updated_at)}
            </p>
          ) : null}
          <SettingsForm settings={row} />
        </>
      ) : (
        <div className="space-y-4">
          <p className="rounded-2xl border border-navy/8 bg-white px-5 py-4 text-sm text-dark/70 shadow-soft">
            View-only access. Only admins can change system settings.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Company", row.company_name],
              ["Trading name", row.trading_name || "—"],
              ["Email", row.email],
              ["Phone", row.phone],
              ["VAT rate", `${row.vat_rate}%`],
              ["Currency", row.currency || "GBP"],
              ["Invoice prefix", row.invoice_prefix],
              ["Next invoice", String(row.invoice_next_number)],
              ["Staff prefix", row.staff_prefix || "RCS-S"],
              ["Next staff ID", String(row.staff_next_number)],
              ["Retention", `${row.data_retention_days} days`],
              ["Timezone", row.timezone || "Europe/London"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-navy/8 bg-white p-4 shadow-soft"
              >
                <p className="text-xs text-dark/60">{label}</p>
                <p className="mt-1 font-semibold text-navy">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import AdminShell from "@/components/admin/AdminShell";
import { requireAdminSession } from "@/lib/admin/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdminSession();
  return <AdminShell profile={profile}>{children}</AdminShell>;
}

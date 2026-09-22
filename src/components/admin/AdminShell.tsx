"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import {
  Briefcase,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  Settings,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  X,
  BarChart3,
} from "lucide-react";
import type { Profile } from "@/lib/admin/types";
import { ROLE_LABELS } from "@/lib/admin/types";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: ClipboardList },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/staff", label: "Staff", icon: UsersRound },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/expenses", label: "Expenses", icon: Wallet },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "System settings", icon: Settings },
  { href: "/admin/profile", label: "My profile", icon: UserRound },
] as const;

type AdminShellProps = {
  profile: Profile;
  children: React.ReactNode;
};

export default function AdminShell({ profile, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-light text-dark">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-navy/10 bg-navy text-white transition lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between gap-2 px-4">
            <div className="min-w-0">
              <BrandLogo variant="light" showWordmark={false} />
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                Admin Operations
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-white/80 lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1 px-3 pb-6">
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-lemon text-navy"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-navy/40 lg:hidden"
            aria-label="Close overlay"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-navy/10 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-navy/10 p-2 text-navy lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <p className="font-heading text-sm font-bold text-navy">
                  Business Operating System
                </p>
                <p className="text-xs text-dark/60">UK operations · GDPR-aware</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/profile"
                className="rounded-xl border border-navy/10 px-3 py-2 text-right transition hover:border-teal"
              >
                <p className="text-sm font-semibold text-navy">
                  {profile.full_name}
                </p>
                <p className="text-xs text-dark/60">
                  {profile.staff_id ? `${profile.staff_id} · ` : ""}
                  {ROLE_LABELS[profile.role]}
                </p>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-xl border border-navy/10 px-3 py-2 text-sm font-semibold text-navy transition hover:border-teal hover:text-teal"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
      <Link
        href="/"
        className="fixed bottom-4 right-4 z-20 hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-navy shadow-soft ring-1 ring-navy/10 sm:inline-flex"
      >
        <Briefcase className="h-3.5 w-3.5" aria-hidden />
        View website
      </Link>
    </div>
  );
}

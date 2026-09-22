const STYLES: Record<string, string> = {
  new: "bg-sky-100 text-sky-800",
  contacted: "bg-indigo-100 text-indigo-800",
  quoted: "bg-violet-100 text-violet-800",
  closing: "bg-amber-100 text-amber-900",
  booked: "bg-emerald-100 text-emerald-800",
  lost: "bg-rose-100 text-rose-800",
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-teal-100 text-teal-900",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-700",
  rescheduled: "bg-orange-100 text-orange-800",
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-sky-100 text-sky-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-rose-100 text-rose-800",
  acknowledged: "bg-indigo-100 text-indigo-800",
  investigating: "bg-amber-100 text-amber-900",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-700",
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-200 text-slate-700",
  low: "bg-slate-100 text-slate-700",
  normal: "bg-sky-100 text-sky-800",
  high: "bg-rose-100 text-rose-800",
  admin: "bg-navy/10 text-navy",
  manager: "bg-teal/15 text-teal",
  scheduler: "bg-sky-100 text-sky-800",
  cleaner: "bg-emerald-100 text-emerald-800",
  finance: "bg-violet-100 text-violet-800",
};

type StatusBadgeProps = {
  value: string;
};

export default function StatusBadge({ value }: StatusBadgeProps) {
  const style = STYLES[value] || "bg-slate-100 text-slate-700";
  const label = value.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}
    >
      {label}
    </span>
  );
}

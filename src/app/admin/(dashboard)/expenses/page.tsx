import Link from "next/link";
import DataTable from "@/components/admin/DataTable";
import ExpenseCreateForm from "@/components/admin/ExpenseCreateForm";
import { requireAdminSession, formatGbp, formatUkDate } from "@/lib/admin/auth";

export const metadata = { title: "Expenses" };

type SearchParams = { new?: string };

type Expense = {
  id: string;
  expense_date: string;
  category: string | null;
  description: string;
  amount: number;
  vendor: string | null;
};

export default async function AdminExpensesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase } = await requireAdminSession([
    "admin",
    "manager",
    "finance",
  ]);

  const { data } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .limit(300);

  const expenses = (data || []) as Expense[];
  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Finance</p>
          <h1 className="heading-lg">Expenses</h1>
          <p className="mt-2 text-sm text-dark/70">
            Track operating costs against revenue.
          </p>
        </div>
        <Link href="/admin/expenses?new=1" className="btn-navy w-fit">
          Log expense
        </Link>
      </div>

      <div className="rounded-2xl border border-navy/8 bg-white p-5 shadow-soft">
        <p className="text-sm text-dark/60">Listed total</p>
        <p className="font-heading text-3xl font-bold text-navy">
          {formatGbp(total)}
        </p>
      </div>

      {searchParams.new === "1" ? <ExpenseCreateForm /> : null}

      <DataTable
        rowKey={(row) => row.id}
        rows={expenses}
        columns={[
          {
            key: "date",
            header: "Date",
            cell: (row) => formatUkDate(row.expense_date),
          },
          {
            key: "category",
            header: "Category",
            cell: (row) => row.category || "—",
          },
          {
            key: "desc",
            header: "Description",
            cell: (row) => (
              <div>
                <p className="font-semibold text-navy">{row.description}</p>
                <p className="text-xs text-dark/60">{row.vendor}</p>
              </div>
            ),
          },
          {
            key: "amount",
            header: "Amount",
            cell: (row) => formatGbp(row.amount),
          },
        ]}
      />
    </div>
  );
}

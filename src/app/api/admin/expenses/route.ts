import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { expenseCreateSchema } from "@/lib/admin/schemas";

export async function GET() {
  const ctx = await getAdminApiContext(["admin", "manager", "finance"]);
  if (!ctx.ok) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ctx = await getAdminApiContext(["admin", "manager", "finance"]);
  if (!ctx.ok) return ctx.error;

  const body = await request.json();
  const parsed = parseBody(expenseCreateSchema, body);
  if (!parsed.ok) return parsed.error;
  const payload = parsed.data;

  const { data, error } = await ctx.supabase
    .from("expenses")
    .insert({
      expense_date: payload.expense_date,
      category: payload.category || "other",
      description: payload.description,
      amount: payload.amount,
      vendor: payload.vendor || null,
      project_id: payload.project_id || null,
      notes: payload.notes || null,
      created_by: ctx.profile.id,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(ctx.supabase, {
    userId: ctx.profile.id,
    action: "create",
    tableName: "expenses",
    recordId: data.id,
    newData: payload,
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}

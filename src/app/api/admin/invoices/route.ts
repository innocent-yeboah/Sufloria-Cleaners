import { NextResponse } from "next/server";
import { getAdminApiContext, parseBody, writeAuditLog } from "@/lib/admin/api";
import { invoiceCreateSchema } from "@/lib/admin/schemas";

export async function GET() {
  const ctx = await getAdminApiContext(["admin", "manager", "finance"]);
  if (!ctx.ok) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("invoices")
    .select("*")
    .order("issue_date", { ascending: false })
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
  const parsed = parseBody(invoiceCreateSchema, body);
  if (!parsed.ok) return parsed.error;
  const payload = parsed.data;

  const { data: settings } = await ctx.supabase
    .from("company_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  const vatRate = payload.vat_rate ?? Number(settings?.vat_rate ?? 20);
  const amount = Number(payload.amount);
  const vatAmount = Math.round(amount * (vatRate / 100) * 100) / 100;
  const total = Math.round((amount + vatAmount) * 100) / 100;
  const prefix = settings?.invoice_prefix || "SUF";
  const nextNumber = settings?.invoice_next_number || 1001;
  const invoiceNumber = `${prefix}-${String(nextNumber).padStart(5, "0")}`;

  const { data, error } = await ctx.supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      client_id: payload.client_id || null,
      booking_id: payload.booking_id || null,
      client_name: payload.client_name,
      client_email: payload.client_email || null,
      client_address: payload.client_address || null,
      amount,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_amount: total,
      status: payload.status || "draft",
      issue_date: payload.issue_date,
      due_date: payload.due_date,
      notes: payload.notes || null,
      created_by: ctx.profile.id,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await ctx.supabase.from("invoice_items").insert({
    invoice_id: data.id,
    description: payload.description || "Cleaning services",
    quantity: 1,
    unit_price: amount,
    total: amount,
  });

  if (settings?.id) {
    await ctx.supabase
      .from("company_settings")
      .update({
        invoice_next_number: nextNumber + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id);
  }

  await writeAuditLog(ctx.supabase, {
    userId: ctx.profile.id,
    action: "create",
    tableName: "invoices",
    recordId: data.id,
    newData: { invoiceNumber, total },
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const statuses = ["pending", "confirmed", "packed", "on_the_way", "delivered", "cancelled"] as const;

async function requireAdmin() {
  const userClient = await createClient();
  const { data: authData } = await userClient.auth.getUser();
  if (!authData.user) return null;
  const { data: profile } = await userClient.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (!profile || !["admin", "manager"].includes(profile.role)) return null;
  return { user: authData.user, role: profile.role, admin: createAdminClient() };
}

export async function GET() {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  let { data: orders, error } = await context.admin
    .from("orders")
    .select("id, order_number, user_id, branch_id, status, total_rwf, delivery_fee_rwf, payment_method, created_at, updated_at, order_items(product_name, product_key, quantity, unit_price_rwf)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error && /product_key/i.test(error.message)) {
    const fallback = await context.admin
      .from("orders")
      .select("id, order_number, user_id, branch_id, status, total_rwf, delivery_fee_rwf, payment_method, created_at, updated_at, order_items(product_name, quantity, unit_price_rwf)")
      .order("created_at", { ascending: false })
      .limit(200);
    orders = fallback.data as typeof orders;
    error = fallback.error;
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = Array.from(new Set((orders || []).map((order) => order.user_id)));
  const { data: profiles } = userIds.length
    ? await context.admin.from("profiles").select("id, full_name, email, phone").in("id", userIds)
    : { data: [] };
  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));

  const productSales = new Map<string, { name: string; quantity: number; revenueRwf: number }>();
  for (const order of orders || []) {
    for (const item of order.order_items || []) {
      const key = ("product_key" in item && item.product_key) || item.product_name;
      const current = productSales.get(key) || { name: item.product_name, quantity: 0, revenueRwf: 0 };
      current.quantity += Number(item.quantity);
      current.revenueRwf += Number(item.unit_price_rwf) * Number(item.quantity);
      productSales.set(key, current);
    }
  }

  const revenueRwf = (orders || [])
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total_rwf), 0);
  const statusCounts = Object.fromEntries(statuses.map((status) => [status, (orders || []).filter((order) => order.status === status).length]));

  return NextResponse.json({
    orders: (orders || []).map((order) => ({
      ...order,
      customer: profileMap.get(order.user_id) || { full_name: "Customer", email: "", phone: "" },
    })),
    analytics: {
      revenueRwf,
      orderCount: orders?.length || 0,
      averageOrderRwf: orders?.length ? Math.round(revenueRwf / orders.length) : 0,
      statusCounts,
      topProducts: Array.from(productSales.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 8),
    },
  });
}

export async function PATCH(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const status = statuses.includes(body?.status) ? body.status as typeof statuses[number] : null;
  if (!orderId || !status) return NextResponse.json({ error: "Valid order and status are required." }, { status: 400 });

  const { data, error } = await context.admin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("id, order_number, status, updated_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await context.admin.from("order_status_events").insert({
    order_id: orderId,
    status,
    note: `Status changed to ${status.replaceAll("_", " ")} by ${context.role}.`,
    created_by: context.user.id,
  });

  return NextResponse.json({ order: data });
}

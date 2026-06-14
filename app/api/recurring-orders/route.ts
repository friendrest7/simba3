import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const frequencies = ["weekly", "biweekly", "monthly"] as const;

function nextDate(frequency: typeof frequencies[number]) {
  const date = new Date();
  date.setDate(date.getDate() + (frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30));
  return date.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const frequency = frequencies.includes(body?.frequency) ? body.frequency as typeof frequencies[number] : null;
  if (!orderId || !frequency) return NextResponse.json({ error: "Order and frequency are required." }, { status: 400 });

  const { data: order } = await supabase
    .from("orders")
    .select("id, delivery_address, order_items(product_key, product_name, unit_price_rwf, quantity)")
    .eq("id", orderId)
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const deliveryAddress = order.delivery_address && typeof order.delivery_address === "object"
    ? order.delivery_address as Record<string, unknown>
    : {};
  const { data, error } = await supabase.from("recurring_orders").insert({
    user_id: authData.user.id,
    source_order_id: order.id,
    frequency,
    next_delivery_date: nextDate(frequency),
    delivery_slot: typeof deliveryAddress.slot === "string" ? deliveryAddress.slot : null,
    items: order.order_items || [],
  }).select("id, source_order_id, frequency, next_delivery_date, active").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recurringOrder: data }, { status: 201 });
}

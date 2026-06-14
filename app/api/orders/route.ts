import { NextResponse } from "next/server";
import { allProducts } from "@/lib/catalog-products";
import { createClient } from "@/lib/supabase/server";

const productByName = new Map(allProducts.map((product) => [product.name.toLowerCase(), product]));

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  subtotal_rwf: number;
  delivery_fee_rwf: number;
  total_rwf: number;
  delivery_address: unknown;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  order_items: Array<Record<string, unknown>>;
};

export async function GET() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, status, subtotal_rwf, delivery_fee_rwf, total_rwf, delivery_address, payment_method, created_at, updated_at, order_items(id, product_key, product_name, product_image_url, product_category, unit_price_rwf, quantity)")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  let source = orders as unknown as OrderRow[] | null;
  if (error && /product_(key|image_url|category)/i.test(error.message)) {
    const fallback = await supabase
      .from("orders")
      .select("id, order_number, status, subtotal_rwf, delivery_fee_rwf, total_rwf, delivery_address, payment_method, created_at, updated_at, order_items(id, product_name, unit_price_rwf, quantity)")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false });
    if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });
    source = fallback.data as unknown as OrderRow[] | null;
  } else if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orderIds = (source || []).map((order) => order.id);
  const [eventResult, recurringResult] = await Promise.all([
    orderIds.length
      ? supabase.from("order_status_events").select("order_id, status, note, created_at").in("order_id", orderIds).order("created_at")
      : Promise.resolve({ data: [], error: null }),
    supabase.from("recurring_orders").select("id, source_order_id, frequency, next_delivery_date, active").eq("user_id", authData.user.id).order("next_delivery_date"),
  ]);

  const normalized = (source || []).map((order) => ({
    ...order,
    items: (order.order_items || []).map((item: Record<string, unknown>) => {
      const product = productByName.get(String(item.product_name || "").toLowerCase());
      return {
        id: item.id,
        productId: item.product_key || product?.id || null,
        productName: item.product_name,
        productImage: item.product_image_url || product?.image || "/images/product-rice.png",
        productCategory: item.product_category || product?.category || "Simba catalog",
        unitPriceRwf: Number(item.unit_price_rwf),
        quantity: Number(item.quantity),
      };
    }),
    events: (eventResult.data || []).filter((event) => event.order_id === order.id),
  }));

  return NextResponse.json({
    orders: normalized,
    recurringOrders: recurringResult.error ? [] : recurringResult.data,
    realtimeEnabled: !eventResult.error,
  });
}

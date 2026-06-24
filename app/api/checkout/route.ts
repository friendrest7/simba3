import { NextResponse } from "next/server";
import { allProducts } from "@/lib/catalog-products";
import { estimatedDeliveryDate, getDeliveryQuote, kigaliDistricts } from "@/lib/delivery";
import { requestMobileMoneyPayment, type MobileMoneyProvider } from "@/lib/payments/mobile-money";
import { createClient } from "@/lib/supabase/server";

type CheckoutBody = {
  items?: Array<{ productId?: unknown; quantity?: unknown }>;
  fulfilment?: unknown;
  branchId?: unknown;
  district?: unknown;
  address?: unknown;
  landmark?: unknown;
  instructions?: unknown;
  deliverySlot?: unknown;
  phone?: unknown;
  paymentProvider?: unknown;
};

const productMap = new Map(allProducts.map((product) => [product.id, product]));

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sign in before checkout." }, { status: 401 });

  const body = await request.json().catch(() => null) as CheckoutBody | null;
  const items = Array.isArray(body?.items) ? body.items.flatMap((item) => {
    const product = productMap.get(text(item.productId, 100));
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) return [];
    return [{ product, quantity }];
  }) : [];
  if (!items.length) return NextResponse.json({ error: "Your cart does not contain valid products." }, { status: 400 });

  const fulfilment = body?.fulfilment === "pickup" ? "pickup" : "delivery";
  const district = text(body?.district, 50);
  const phone = text(body?.phone, 30).replace(/\s/g, "");
  const paymentProvider = body?.paymentProvider === "mtn_momo" || body?.paymentProvider === "airtel_money"
    ? body.paymentProvider
    : body?.paymentProvider === "cash" ? "cash" : null;
  if (!paymentProvider || !/^\+2507[2389]\d{7}$/.test(phone)) {
    return NextResponse.json({ error: "Choose a payment method and enter a valid Rwandan phone number." }, { status: 400 });
  }
  if (fulfilment === "delivery" && !kigaliDistricts.includes(district as never)) {
    return NextResponse.json({ error: "Choose a supported Kigali district." }, { status: 400 });
  }

  const subtotalRwf = items.reduce((sum, item) => sum + Math.round(item.product.price * 1450) * item.quantity, 0);
  const quote = getDeliveryQuote(district, fulfilment, subtotalRwf);
  const totalRwf = subtotalRwf + quote.feeRwf;

  if (totalRwf < 2500) {
    return NextResponse.json({ error: "Minimum order amount is 2,500 RWF." }, { status: 400 });
  }

  const estimatedAt = estimatedDeliveryDate(quote.estimatedHours);
  const deliveryAddress = {
    fulfilment,
    district: fulfilment === "delivery" ? district : null,
    address: text(body?.address, 250),
    landmark: text(body?.landmark, 200),
    instructions: text(body?.instructions, 500),
    phone,
    slot: text(body?.deliverySlot, 50),
    zone: quote.zone,
  };

  const orderPayload = {
    user_id: authData.user.id,
    branch_id: text(body?.branchId, 100) || null,
    status: paymentProvider === "cash" ? "confirmed" : "pending",
    subtotal_rwf: subtotalRwf,
    delivery_fee_rwf: quote.feeRwf,
    total_rwf: totalRwf,
    delivery_address: deliveryAddress,
    payment_method: paymentProvider,
  };
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id, order_number")
    .single();
  if (orderError || !order) return NextResponse.json({ error: orderError?.message || "Order creation failed." }, { status: 500 });

  const detailedItems = items.map(({ product, quantity }) => ({
    order_id: order.id,
    product_key: product.id,
    product_name: product.name,
    product_image_url: product.image,
    product_category: product.category,
    unit_price_rwf: Math.round(product.price * 1450),
    quantity,
  }));
  let itemResult = await supabase.from("order_items").insert(detailedItems);
  if (itemResult.error && /product_(key|image_url|category)/i.test(itemResult.error.message)) {
    itemResult = await supabase.from("order_items").insert(detailedItems.map((item) => ({
      order_id: item.order_id,
      product_name: item.product_name,
      unit_price_rwf: item.unit_price_rwf,
      quantity: item.quantity,
    })));
  }
  if (itemResult.error) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemResult.error.message }, { status: 500 });
  }

  await supabase.from("order_status_events").insert({
    order_id: order.id,
    status: paymentProvider === "cash" ? "confirmed" : "pending",
    note: paymentProvider === "cash" ? "Cash order confirmed." : "Waiting for mobile money approval.",
    created_by: authData.user.id,
  });

  if (paymentProvider === "cash") {
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      paymentStatus: "pending",
      orderStatus: "confirmed",
      totalRwf,
      deliveryFeeRwf: quote.feeRwf,
      estimatedDeliveryAt: estimatedAt,
      items: detailedItems.map(i => ({ name: i.product_name, quantity: i.quantity, price: i.unit_price_rwf })),
    }, { status: 201 });
  }

  try {
    const callbackUrl = new URL("/api/payments/callback", request.url).toString();
    const payment = await requestMobileMoneyPayment({
      provider: paymentProvider as MobileMoneyProvider,
      amountRwf: totalRwf,
      phone,
      orderNumber: order.order_number,
      callbackUrl,
    });
    const paymentInsert = await supabase.from("payments").insert({
      order_id: order.id,
      user_id: authData.user.id,
      provider: paymentProvider,
      status: payment.status,
      amount_rwf: totalRwf,
      phone,
      provider_transaction_id: payment.providerReference,
      provider_reference: order.order_number,
      raw_response: payment.raw,
    }).select("id").maybeSingle();
    const paymentId = paymentInsert.data?.id || `demo:${paymentProvider}:${order.id}:${payment.providerReference}`;

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      paymentId,
      providerReference: payment.providerReference,
      paymentStatus: payment.status,
      orderStatus: "pending",
      totalRwf,
      deliveryFeeRwf: quote.feeRwf,
      estimatedDeliveryAt: estimatedAt,
      demoPayment: payment.demo,
      items: detailedItems.map(i => ({ name: i.product_name, quantity: i.quantity, price: i.unit_price_rwf })),
    }, { status: 201 });
  } catch (paymentError) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json({
      error: paymentError instanceof Error ? paymentError.message : "Mobile money initiation failed.",
      orderNumber: order.order_number,
    }, { status: 502 });
  }
}

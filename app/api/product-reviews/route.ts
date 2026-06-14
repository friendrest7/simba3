import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const productKey = new URL(request.url).searchParams.get("productKey")?.slice(0, 100);
  if (!productKey) return NextResponse.json({ error: "Product key is required." }, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_reviews")
    .select("id, user_id, rating, title, message, verified_purchase, created_at")
    .eq("product_key", productKey)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ reviews: [], average: 0, count: 0, migrationRequired: true });
  const userIds = Array.from(new Set(data.map((review) => review.user_id)));
  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] };
  const names = new Map((profiles || []).map((profile) => [profile.id, profile.full_name || "Verified buyer"]));
  const average = data.length ? data.reduce((sum, review) => sum + review.rating, 0) / data.length : 0;
  return NextResponse.json({
    reviews: data.map((review) => ({ ...review, customerName: names.get(review.user_id) || "Verified buyer" })),
    average: Number(average.toFixed(1)),
    count: data.length,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sign in to review a verified purchase." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const productKey = typeof body?.productKey === "string" ? body.productKey.slice(0, 100) : "";
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const rating = Number(body?.rating);
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : "";
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 2000) : "";
  if (!productKey || !orderId || !Number.isInteger(rating) || rating < 1 || rating > 5 || message.length < 3) {
    return NextResponse.json({ error: "Choose a delivered order, rating, and review message." }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, order_items(product_key)")
    .eq("id", orderId)
    .eq("user_id", authData.user.id)
    .eq("status", "delivered")
    .maybeSingle();
  if (!order || !(order.order_items || []).some((item) => item.product_key === productKey)) {
    return NextResponse.json({ error: "Only verified purchasers with a delivered order can review this product." }, { status: 403 });
  }

  const { data, error } = await supabase.from("product_reviews").insert({
    product_key: productKey,
    user_id: authData.user.id,
    order_id: orderId,
    rating,
    title: title || null,
    message,
    verified_purchase: true,
  }).select("id, rating, title, message, verified_purchase, created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: { ...data, customerName: "You" } }, { status: 201 });
}

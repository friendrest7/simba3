import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sign in to join the stock waitlist." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const productKey = typeof body?.productKey === "string" ? body.productKey.slice(0, 100) : "";
  if (!productKey) return NextResponse.json({ error: "Product is required." }, { status: 400 });
  const { error } = await supabase.from("stock_waitlist").upsert({
    user_id: authData.user.id,
    product_key: productKey,
  }, { onConflict: "user_id,product_key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ joined: true });
}

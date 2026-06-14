import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AccountState = {
  cart?: Array<{ productId: string; quantity: number }>;
  wishlist?: string[];
};

export async function GET() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [cartResult, wishlistResult] = await Promise.all([
    supabase.from("user_cart_items").select("product_key, quantity").eq("user_id", authData.user.id),
    supabase.from("wishlist_items").select("product_key").eq("user_id", authData.user.id),
  ]);

  if (cartResult.error || wishlistResult.error) {
    return NextResponse.json({ cart: [], wishlist: [], synced: false });
  }

  return NextResponse.json({
    cart: cartResult.data.map((item) => ({ productId: item.product_key, quantity: item.quantity })),
    wishlist: wishlistResult.data.map((item) => item.product_key),
    synced: true,
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as AccountState | null;
  const cart = Array.isArray(body?.cart)
    ? body.cart.filter((item) => typeof item.productId === "string" && Number.isInteger(item.quantity) && item.quantity > 0)
    : [];
  const wishlist = Array.isArray(body?.wishlist)
    ? body.wishlist.filter((item): item is string => typeof item === "string" && item.length <= 100)
    : [];

  const { error: cartDeleteError } = await supabase.from("user_cart_items").delete().eq("user_id", authData.user.id);
  const { error: wishlistDeleteError } = await supabase.from("wishlist_items").delete().eq("user_id", authData.user.id);
  if (cartDeleteError || wishlistDeleteError) return NextResponse.json({ synced: false });

  const [cartInsert, wishlistInsert] = await Promise.all([
    cart.length
      ? supabase.from("user_cart_items").insert(cart.map((item) => ({
        user_id: authData.user!.id,
        product_key: item.productId,
        quantity: Math.min(999, item.quantity),
      })))
      : Promise.resolve({ error: null }),
    wishlist.length
      ? supabase.from("wishlist_items").insert(wishlist.map((productId) => ({
        user_id: authData.user!.id,
        product_key: productId,
      })))
      : Promise.resolve({ error: null }),
  ]);

  return NextResponse.json({ synced: !cartInsert.error && !wishlistInsert.error });
}

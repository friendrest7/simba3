import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/qr-payment?orderId=xxx&amount=xxx&orderNumber=xxx
 *
 * Returns a base64-encoded PNG data-URI of a QR code that encodes
 * a payment intent string for in-store scanning terminals.
 *
 * The QR payload format:
 *   SIMBA_PAY|orderNumber|amountRwf|userId
 *
 * Requires an authenticated session so the QR code cannot be
 * generated for arbitrary orders.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId") ?? "";
  const amountRaw = searchParams.get("amount") ?? "";
  const orderNumber = searchParams.get("orderNumber") ?? "";

  if (!orderId || !amountRaw || !orderNumber) {
    return NextResponse.json({ error: "orderId, amount, and orderNumber are required." }, { status: 400 });
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number." }, { status: 400 });
  }

  // Verify the order belongs to the authenticated user
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number, total_rwf")
    .eq("id", orderId)
    .eq("user_id", authData.user.id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Build the QR payload — encode enough info for the POS terminal
  const payload = `SIMBA_PAY|${order.order_number}|${order.total_rwf}|${authData.user.id}`;

  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 320,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    });

    return NextResponse.json({ qrDataUrl: dataUrl, orderNumber: order.order_number, amountRwf: order.total_rwf });
  } catch (err) {
    console.error("QR generation error:", err);
    return NextResponse.json({ error: "Failed to generate QR code." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  console.info("[mobile-money-callback]", payload);
  return NextResponse.json({ received: true });
}

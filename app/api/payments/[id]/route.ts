import { NextResponse } from "next/server";
import { getMobileMoneyStatus, type MobileMoneyProvider } from "@/lib/payments/mobile-money";
import { createClient } from "@/lib/supabase/server";

type PaymentRecord = {
  id: string;
  order_id: string;
  provider: MobileMoneyProvider;
  status: string;
  provider_transaction_id: string;
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payment: PaymentRecord;

  if (id.startsWith("demo:")) {
    const [, provider, orderId, ...referenceParts] = id.split(":");
    payment = {
      id,
      order_id: orderId,
      provider: provider as MobileMoneyProvider,
      status: "pending",
      provider_transaction_id: referenceParts.join(":"),
    };
  } else {
    const result = await supabase
      .from("payments")
      .select("id, order_id, provider, status, provider_transaction_id")
      .eq("id", id)
      .eq("user_id", authData.user.id)
      .maybeSingle();
    if (result.error || !result.data) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    payment = result.data as PaymentRecord;
  }

  const status = await getMobileMoneyStatus(payment.provider, payment.provider_transaction_id);
  if (!id.startsWith("demo:")) {
    await supabase.from("payments").update({
      status: status.status,
      raw_response: status.raw,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
  }
  if (status.status === "successful") {
    const updateResult = await supabase.from("orders").update({ status: "confirmed", payment_status: "successful" }).eq("id", payment.order_id);
    if (updateResult.error && /payment_status/i.test(updateResult.error.message)) {
      await supabase.from("orders").update({ status: "confirmed" }).eq("id", payment.order_id);
    }
    await supabase.from("order_status_events").insert({
      order_id: payment.order_id,
      status: "confirmed",
      note: "Mobile money payment confirmed.",
      created_by: authData.user.id,
    });
  } else if (status.status === "failed") {
    const updateResult = await supabase.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", payment.order_id);
    if (updateResult.error && /payment_status/i.test(updateResult.error.message)) {
      await supabase.from("orders").update({ status: "cancelled" }).eq("id", payment.order_id);
    }
  }

  return NextResponse.json({ status: status.status, providerReference: status.providerReference, demo: status.demo });
}

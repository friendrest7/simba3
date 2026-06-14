import { after, NextResponse } from "next/server";
import { branches } from "@/lib/data";
import { sendReviewNotification } from "@/lib/review-email";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ReviewRequest = {
  rating?: unknown;
  message?: unknown;
  orderId?: unknown;
  branchId?: unknown;
  fulfilmentMethod?: unknown;
};

type OrderContext = {
  id: string;
  order_number: string;
  branch_id: string | null;
  delivery_address: unknown;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function optionalString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function getFulfilment(value: unknown): "delivery" | "pickup" | undefined {
  return value === "delivery" || value === "pickup" ? value : undefined;
}

function getOrderFulfilment(deliveryAddress: unknown) {
  if (!deliveryAddress || typeof deliveryAddress !== "object") return undefined;
  return getFulfilment((deliveryAddress as Record<string, unknown>).fulfilment);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as ReviewRequest | null;
  const rating = Number(body?.rating);
  const message = optionalString(body?.message, 2000);
  const requestedOrderReference = optionalString(body?.orderId, 100);
  const requestedBranchId = optionalString(body?.branchId, 100);
  const requestedFulfilment = getFulfilment(body?.fulfilmentMethod);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !message) {
    return NextResponse.json(
      { error: "A rating from 1 to 5 and a review message are required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData.user;
  if (authError || !user) {
    return NextResponse.json({ error: "You must be signed in to submit a review." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[reviews] Customer profile lookup failed:", {
      userId: user.id,
      error: profileError.message,
    });
  }

  let order: OrderContext | null = null;
  if (requestedOrderReference) {
    const orderQuery = supabase
      .from("orders")
      .select("id, order_number, branch_id, delivery_address");
    const orderResult = uuidPattern.test(requestedOrderReference)
      ? await orderQuery.eq("id", requestedOrderReference).maybeSingle()
      : await orderQuery.eq("order_number", requestedOrderReference).maybeSingle();

    if (orderResult.error) {
      console.error("[reviews] Optional order lookup failed:", {
        userId: user.id,
        orderReference: requestedOrderReference,
        error: orderResult.error.message,
      });
    } else {
      order = orderResult.data as OrderContext | null;
    }
  }

  const branchId = order?.branch_id
    || (requestedBranchId && branches.some((branch) => branch.id === requestedBranchId)
      ? requestedBranchId
      : undefined);
  const branch = branches.find((item) => item.id === branchId);
  const fulfilmentMethod = getOrderFulfilment(order?.delivery_address) || requestedFulfilment;
  const orderReference = order?.order_number || requestedOrderReference;
  const metadataName = typeof user.user_metadata?.full_name === "string"
    ? user.user_metadata.full_name.trim()
    : "";
  const customerName = profile?.full_name?.trim()
    || metadataName
    || user.email?.split("@")[0].replace(/[._-]/g, " ")
    || "Simba customer";
  const customerEmail = profile?.email?.trim() || user.email || "";

  if (!customerEmail) {
    return NextResponse.json({ error: "Your account does not have an email address." }, { status: 400 });
  }

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      customer_name: customerName,
      customer_email: customerEmail,
      rating,
      message,
      order_id: order?.id || null,
      order_reference: orderReference || null,
      branch_id: branch?.id || null,
      branch_name: branch?.name || null,
      fulfilment_method: fulfilmentMethod || null,
    })
    .select("id, created_at")
    .single();

  if (reviewError || !review) {
    console.error("[reviews] Review save failed:", {
      userId: user.id,
      error: reviewError?.message || "No review returned after insert.",
    });
    return NextResponse.json({ error: "Your review could not be saved. Please try again." }, { status: 500 });
  }

  after(async () => {
    try {
      await sendReviewNotification({
        reviewId: review.id,
        customerName,
        customerEmail,
        rating,
        message,
        orderReference,
        branchInfo: branch ? `${branch.name}, ${branch.address}` : undefined,
        fulfilmentMethod,
        submittedAt: review.created_at,
      });
    } catch (error) {
      console.error("[reviews] Email notification failed:", {
        reviewId: review.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  return NextResponse.json(
    {
      review: {
        id: review.id,
        createdAt: review.created_at,
      },
    },
    { status: 201 },
  );
}

import { NextResponse } from "next/server";
import { kigaliDistricts } from "@/lib/delivery";
import { createClient } from "@/lib/supabase/server";

function validPhone(value: string) {
  return /^\+2507[2389]\d{7}$/.test(value);
}

export async function GET() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase
    .from("delivery_addresses")
    .select("*")
    .eq("user_id", authData.user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ addresses: [], migrationRequired: true });
  return NextResponse.json({ addresses: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);

  const district = typeof body?.district === "string" ? body.district : "";
  const phone = typeof body?.phone === "string" ? body.phone.replace(/\s/g, "") : "";
  const recipientName = typeof body?.recipientName === "string" ? body.recipientName.trim().slice(0, 120) : "";
  const streetAddress = typeof body?.streetAddress === "string" ? body.streetAddress.trim().slice(0, 250) : "";
  if (!kigaliDistricts.includes(district as never) || !validPhone(phone) || recipientName.length < 2 || streetAddress.length < 4) {
    return NextResponse.json({ error: "Complete the recipient, Rwandan phone, Kigali district, and street address." }, { status: 400 });
  }

  const isDefault = Boolean(body?.isDefault);
  if (isDefault) {
    await supabase.from("delivery_addresses").update({ is_default: false }).eq("user_id", authData.user.id);
  }

  const { data, error } = await supabase.from("delivery_addresses").insert({
    user_id: authData.user.id,
    label: typeof body?.label === "string" ? body.label.trim().slice(0, 50) || "Home" : "Home",
    recipient_name: recipientName,
    phone,
    district,
    sector: typeof body?.sector === "string" ? body.sector.trim().slice(0, 100) : null,
    street_address: streetAddress,
    landmark: typeof body?.landmark === "string" ? body.landmark.trim().slice(0, 200) : null,
    instructions: typeof body?.instructions === "string" ? body.instructions.trim().slice(0, 500) : null,
    is_default: isDefault,
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ address: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Address ID is required." }, { status: 400 });
  const { error } = await supabase.from("delivery_addresses").delete().eq("id", id).eq("user_id", authData.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}

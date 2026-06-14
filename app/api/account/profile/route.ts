import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function validRwandanPhone(value: string) {
  return /^\+2507[2389]\d{7}$/.test(value);
}

export async function GET() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let { data, error } = await supabase
    .from("profiles")
    .select("full_name, email, phone, role, preferred_language, preferred_theme")
    .eq("id", authData.user.id)
    .single();
  if (error && /preferred_(language|theme)/i.test(error.message)) {
    const fallback = await supabase
      .from("profiles")
      .select("full_name, email, phone, role")
      .eq("id", authData.user.id)
      .single();
    data = fallback.data ? { ...fallback.data, preferred_language: "en", preferred_theme: "system" } : null;
    error = fallback.error;
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim().slice(0, 120) : "";
  const phone = typeof body?.phone === "string" ? body.phone.replace(/\s/g, "") : "";
  if (fullName.length < 2 || !validRwandanPhone(phone)) {
    return NextResponse.json({ error: "Enter a full name and a valid Rwandan phone number such as +250788123456." }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update({
    full_name: fullName,
    phone,
    updated_at: new Date().toISOString(),
  }).eq("id", authData.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.auth.updateUser({ data: { full_name: fullName, phone } });
  return NextResponse.json({ updated: true });
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ShopAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/shop/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "manager") redirect("/dashboard/manager");
  if (profile?.role === "admin") redirect("/dashboard/admin");
  redirect("/dashboard/client");
}

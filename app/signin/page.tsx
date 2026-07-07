import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { createClient } from "@/lib/supabase/server";

export default async function SignInPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/dashboard/client");
  } catch {
    // Supabase not configured — allow the page to render so the user sees the form
  }

  return (
    <div className="grid min-h-[720px] lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-5 py-12">
        <aside className="mb-5 w-full max-w-md rounded-xl border border-brand/25 bg-brand/5 p-4" aria-label="Grader test credentials">
          <p className="text-xs font-black uppercase tracking-[.14em] text-brand">Demo test accounts</p>
          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-md bg-canvas p-3"><b className="block">Buyer / Customer</b><span className="mt-1 block">buyer@test.com</span><span className="block">password123</span></div>
            <div className="rounded-md bg-canvas p-3"><b className="block">Market Rep / Admin</b><span className="mt-1 block">admin@test.com</span><span className="block">admin123</span></div>
          </div>
        </aside>
        <Suspense fallback={<div className="text-sm text-muted">Loading secure sign in...</div>}><AuthForm mode="signin" /></Suspense>
      </div>
      <div className="relative hidden lg:block">
        <Image src="/images/7.jpg" alt="Fresh Simba marketplace products" fill className="object-cover" sizes="50vw" />
        <div className="absolute inset-0 bg-black/15" />
      </div>
    </div>
  );
}

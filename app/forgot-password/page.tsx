"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return setError("Authentication is unavailable.");
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (resetError) return setError(resetError.message);
    setMessage("Check your email for a secure password reset link.");
  }

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md items-center px-4 py-16">
      <form onSubmit={submit} className="w-full rounded-xl border border-line p-6 sm:p-8">
        <span className="eyebrow">Account recovery</span>
        <h1 className="mt-3 text-3xl font-black">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Enter the email used for your Simba account.</p>
        <label className="form-label mt-6" htmlFor="reset-email">Email address</label>
        <div className="relative"><Mail className="input-icon" /><input id="reset-email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="form-input pl-11" /></div>
        {message && <p role="status" className="mt-4 flex gap-2 rounded-md bg-green-100 p-3 text-sm font-bold text-green-700"><CheckCircle2 className="h-4 w-4 shrink-0" /> {message}</p>}
        {error && <p role="alert" className="mt-4 rounded-md bg-red-100 p-3 text-sm font-bold text-red-700">{error}</p>}
        <button disabled={loading} className="button-primary mt-5 w-full">{loading && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link</button>
        <Link href="/signin" className="mt-5 block text-center text-sm font-bold text-brand">Back to sign in</Link>
      </form>
    </div>
  );
}

"use client";

import { CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirmPassword) return setError("The passwords do not match.");
    const supabase = createClient();
    if (!supabase) return setError("Authentication is unavailable.");
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) return setError(updateError.message);
    setMessage("Your password has been updated. You can now continue to your account.");
  }

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md items-center px-4 py-16">
      <form onSubmit={submit} className="w-full rounded-xl border border-line p-6 sm:p-8">
        <LockKeyhole className="h-8 w-8 text-brand" />
        <h1 className="mt-4 text-3xl font-black">Choose a new password</h1>
        <div className="mt-6"><label className="form-label">New password</label><input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="form-input" /></div>
        <div className="mt-4"><label className="form-label">Confirm password</label><input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="form-input" /></div>
        {message && <p role="status" className="mt-4 flex gap-2 rounded-md bg-green-100 p-3 text-sm font-bold text-green-700"><CheckCircle2 className="h-4 w-4" /> {message}</p>}
        {error && <p role="alert" className="mt-4 rounded-md bg-red-100 p-3 text-sm font-bold text-red-700">{error}</p>}
        <button disabled={loading || Boolean(message)} className="button-primary mt-5 w-full">{loading && <Loader2 className="h-4 w-4 animate-spin" />} Update password</button>
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "./store-provider";

type StaffRole = "manager" | "admin" | "driver" | "ceo";

const staffRoles: Array<{ value: StaffRole; label: string }> = [
  { value: "manager", label: "Branch manager" },
  { value: "admin", label: "General manager" },
  { value: "driver", label: "Delivery driver" },
  { value: "ceo", label: "Africa CEO" },
];

function safeDestination(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : null;
}

function normalizeOptionalPhone(value: string) {
  const compact = value.replace(/[^\d+]/g, "");
  if (!compact) return "";
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("0")) return `+250${compact.slice(1)}`;
  if (compact.startsWith("250")) return `+${compact}`;
  return `+250${compact}`;
}

function messageForError(message: string) {
  if (/invalid login credentials/i.test(message)) return "The email or password is incorrect.";
  if (/email not confirmed/i.test(message)) return "Confirm your email before signing in.";
  if (/user already registered/i.test(message)) return "An account already exists for this email.";
  if (/password should be/i.test(message)) return "Use a password with at least 8 characters.";
  if (/rate limit/i.test(message)) return "Too many attempts. Wait a moment and try again.";
  return message || "Authentication could not be completed.";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.7A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9.2L6.5 14Z" />
      <path fill="#EA4335" d="M12 6.1c1.5 0 2.9.5 3.9 1.5l2.9-2.9A9.7 9.7 0 0 0 3.1 7.5l3.4 2.7A5.9 5.9 0 0 1 12 6.1Z" />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const { t } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const destination = safeDestination(params.get("next"));
  const supabase = useMemo(() => createClient(), []);
  const isSignUp = mode === "signup";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staffMode, setStaffMode] = useState(false);
  const [staffRole, setStaffRole] = useState<StaffRole>("manager");
  const [authError, setAuthError] = useState(params.get("error") || "");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function profileFor(user: SupabaseUser) {
    if (!supabase) throw new Error("Supabase authentication is not configured.");

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return { profile: data, error };
  }

  async function finishAuthentication(user: SupabaseUser) {
    if (!supabase) throw new Error("Supabase authentication is not configured.");

    const { profile, error } = await profileFor(user);
    const role = profile?.role || "customer";

    if (staffMode) {
      if (error) {
        await supabase.auth.signOut();
        throw new Error("Staff profiles are not configured. Run supabase/schema.sql and assign this separate staff account a role.");
      }
      if (role === "customer") {
        await supabase.auth.signOut();
        throw new Error("This account is a customer account and does not have staff access.");
      }
      if (role !== staffRole) {
        await supabase.auth.signOut();
        throw new Error(`This account is assigned to the ${String(role).replace("_", " ")} role, not ${staffRole}.`);
      }
      router.replace(`/dashboard/${role}`);
    } else {
      const next = destination || (role === "customer" ? "/dashboard/client" : `/dashboard/${role}`);
      router.replace(next);
    }
    router.refresh();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setAuthError("");
    setNotice("");
    setLoading(true);

    try {
      if (!supabase) throw new Error("Supabase authentication is not configured.");

      if (isSignUp) {
        if (password !== confirmPassword) throw new Error("The passwords do not match.");
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.");

        const normalizedPhone = normalizeOptionalPhone(phone);
        if (normalizedPhone && !/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
          throw new Error("Enter a valid phone number with country code or leave it blank.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: normalizedPhone || null,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination || "/dashboard/client")}`,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice(t("checkEmail"));
          return;
        }
        if (data.user) await finishAuthentication(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        if (!data.user) throw new Error("Supabase did not return a signed-in user.");
        await finishAuthentication(data.user);
      }
    } catch (error) {
      setAuthError(messageForError(error instanceof Error ? error.message : ""));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setAuthError("");
    setNotice("");
    setLoading(true);

    try {
      if (!supabase) throw new Error("Supabase authentication is not configured.");

      const next = destination || "/dashboard/client";
      const redirectTo = new URL("/auth/callback", window.location.origin);
      redirectTo.searchParams.set("next", next);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo.toString(),
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      setAuthError(messageForError(error instanceof Error ? error.message : ""));
      setLoading(false);
    }
  }

  function fillDemoAccount(kind: "buyer" | "admin") {
    const admin = kind === "admin";
    setEmail(admin ? "admin@test.com" : "buyer@test.com");
    setPassword(admin ? "admin123" : "password123");
    setStaffMode(admin);
    if (admin) setStaffRole("admin");
    setAuthError("");
    setNotice("");
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <span className="eyebrow">{isSignUp ? t("joinMarketplace") : t("welcomeBack")}</span>
      <h1 className="mt-4 text-4xl font-black tracking-tight">
        {staffMode ? t("staffSignInTitle") : isSignUp ? t("signUpTitle") : t("signInTitle")}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">{staffMode ? t("staffAuthText") : t("authText")}</p>

      {isSignUp && (
        <div className="mt-7">
          <label className="form-label">{t("fullName")}</label>
          <div className="relative">
            <UserRound className="input-icon" />
            <input required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="form-input pl-11" placeholder={t("fullName")} />
          </div>
        </div>
      )}

      <div className={isSignUp ? "mt-4" : "mt-7"}>
        <label className="form-label">{t("email")}</label>
        <div className="relative">
          <Mail className="input-icon" />
          <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="form-input pl-11" placeholder="you@example.com" />
        </div>
      </div>

      {isSignUp && (
        <div className="mt-4">
          <label className="form-label">{t("phone")} <span className="font-normal text-muted">({t("optional")})</span></label>
          <div className="relative">
            <Phone className="input-icon" />
            <input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="form-input pl-11" placeholder="+250 78 123 4567" />
          </div>
          <p className="mt-2 text-[11px] text-muted">{t("phoneProfileHelp")}</p>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between"><label className="form-label">{t("password")}</label>{!isSignUp && <Link href="/forgot-password" className="mb-2 text-xs font-bold text-brand">{t("forgotPassword")}</Link>}</div>
        <div className="relative">
          <LockKeyhole className="input-icon" />
          <input required type={showPassword ? "text" : "password"} minLength={8} autoComplete={isSignUp ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="form-input px-11" />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-muted" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isSignUp && (
        <div className="mt-4">
          <label className="form-label">{t("confirmPassword")}</label>
          <div className="relative">
            <LockKeyhole className="input-icon" />
            <input required type={showPassword ? "text" : "password"} minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="form-input pl-11" />
          </div>
        </div>
      )}

      {authError && <p role="alert" className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-xs font-bold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{authError}</p>}
      {!supabase && <p role="alert" className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Authentication is temporarily unavailable because Supabase is not configured.</p>}
      {notice && <p className="mt-4 flex items-center gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-xs font-bold text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200"><CheckCircle2 className="h-4 w-4" /> {notice}</p>}

      <button disabled={!supabase || loading || Boolean(notice)} className="button-primary mt-6 w-full disabled:opacity-60">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? t("verifying") : isSignUp ? t("signup") : t("signin")}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>

      {!staffMode && (
        <>
          <div className="my-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[.14em] text-muted">
            <span className="h-px flex-1 bg-line" />
            {t("or")}
            <span className="h-px flex-1 bg-line" />
          </div>
          <button
            type="button"
            disabled={!supabase || loading || Boolean(notice)}
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-canvas px-5 py-3 text-sm font-black transition hover:border-brand disabled:opacity-60"
          >
            <GoogleIcon />
            {t("continueWithGoogle")}
          </button>
        </>
      )}

      {!isSignUp && (
        <>
          <section className="mt-5 rounded-lg border border-brand/25 bg-brand/5 p-4" aria-labelledby="demo-accounts-title">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 id="demo-accounts-title" className="text-sm font-black">Test credentials</h2>
                <p className="mt-1 text-[11px] text-muted">Select an account, then press Sign in.</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-brand" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => fillDemoAccount("buyer")} className="min-h-14 rounded-md border border-line bg-canvas p-3 text-left text-xs transition hover:border-brand">
                <strong className="block">Buyer</strong>
                <span className="mt-1 block text-muted">buyer@test.com</span>
                <span className="block text-muted">password123</span>
              </button>
              <button type="button" onClick={() => fillDemoAccount("admin")} className="min-h-14 rounded-md border border-line bg-canvas p-3 text-left text-xs transition hover:border-brand">
                <strong className="block">Market Rep / Admin</strong>
                <span className="mt-1 block text-muted">admin@test.com</span>
                <span className="block text-muted">admin123</span>
              </button>
            </div>
          </section>
          <div className="mt-5 rounded-lg border border-line p-4">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-black">
              <input type="checkbox" checked={staffMode} onChange={(event) => setStaffMode(event.target.checked)} className="h-4 w-4 accent-[rgb(var(--brand))]" />
              <ShieldCheck className="h-4 w-4 text-brand" />
              {t("signInAsStaff")}
            </label>
            {staffMode && (
              <div className="mt-4">
                <label className="form-label">{t("staffRole")}</label>
                <select value={staffRole} onChange={(event) => setStaffRole(event.target.value as StaffRole)} className="form-input">
                  {staffRoles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                </select>
                <p className="mt-2 text-[11px] leading-5 text-muted">{t("staffRoleHelp")}</p>
              </div>
            )}
          </div>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        {isSignUp ? t("alreadyAccount") : t("newToSimba")}{" "}
        <Link href={`${isSignUp ? "/signin" : "/signup"}${destination ? `?next=${encodeURIComponent(destination)}` : ""}`} className="font-bold text-brand">
          {isSignUp ? t("signin") : t("signup")}
        </Link>
      </p>
    </form>
  );
}

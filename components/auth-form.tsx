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

type AuthMethod = "email" | "phone";
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

function normalizePhone(value: string) {
  const compact = value.replace(/[^\d+]/g, "");
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
  if (/token has expired|invalid.*token/i.test(message)) return "The verification code is invalid or expired.";
  if (/phone provider|sms provider|unsupported phone/i.test(message)) return "Phone authentication is not enabled in Supabase yet.";
  if (/rate limit/i.test(message)) return "Too many attempts. Wait a moment and try again.";
  return message || "Authentication could not be completed.";
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const { t } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const destination = safeDestination(params.get("next"));
  const supabase = useMemo(() => createClient(), []);
  const isSignUp = mode === "signup";
  const [method, setMethod] = useState<AuthMethod>("email");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staffMode, setStaffMode] = useState(false);
  const [staffRole, setStaffRole] = useState<StaffRole>("manager");
  const [authError, setAuthError] = useState(params.get("error") || "");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function profileFor(user: SupabaseUser) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return { profile: data, error };
  }

  async function finishAuthentication(user: SupabaseUser) {
    const { profile, error } = await profileFor(user);
    const role = profile?.role || user.user_metadata?.role || "customer";

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

  async function submitEmail() {
    if (isSignUp) {
      if (password !== confirmPassword) throw new Error("The passwords do not match.");
      if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination || "/dashboard/client")}`,
        },
      });
      if (error) throw error;
      if (!data.session) {
        setNotice(t("checkEmail"));
        return;
      }
      if (data.user) await finishAuthentication(data.user);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error("Supabase did not return a signed-in user.");
    await finishAuthentication(data.user);
  }

  async function submitPhone() {
    const normalizedPhone = normalizePhone(phone);
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) throw new Error("Enter a valid phone number with country code.");

    if (!otpSent) {
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          shouldCreateUser: isSignUp,
          data: isSignUp ? { full_name: fullName.trim() } : undefined,
        },
      });
      if (error) throw error;
      setOtpSent(true);
      setNotice(t("codeSent"));
      return;
    }

    if (otp.length !== 6) throw new Error("Enter the 6-digit verification code.");
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: otp,
      type: "sms",
    });
    if (error) throw error;
    if (!data.user) throw new Error("Supabase did not return a verified user.");
    await finishAuthentication(data.user);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setAuthError("");
    setNotice("");
    setLoading(true);
    try {
      if (method === "phone") await submitPhone();
      else await submitEmail();
    } catch (error) {
      setAuthError(messageForError(error instanceof Error ? error.message : ""));
    } finally {
      setLoading(false);
    }
  }

  function changeMethod(nextMethod: AuthMethod) {
    setMethod(nextMethod);
    setAuthError("");
    setNotice("");
    setOtp("");
    setOtpSent(false);
    if (nextMethod === "phone") setStaffMode(false);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <span className="eyebrow">{isSignUp ? t("joinMarketplace") : t("welcomeBack")}</span>
      <h1 className="mt-4 text-4xl font-black tracking-tight">
        {staffMode ? t("staffSignInTitle") : isSignUp ? t("signUpTitle") : t("signInTitle")}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">{staffMode ? t("staffAuthText") : t("authText")}</p>

      <div className="mt-7 grid grid-cols-2 gap-1 rounded-lg bg-black/[.045] p-1 dark:bg-white/[.06]">
        <button type="button" onClick={() => changeMethod("email")} className={`flex h-11 items-center justify-center gap-2 rounded-md text-xs font-black ${method === "email" ? "bg-canvas text-brand shadow-sm" : "text-muted"}`}>
          <Mail className="h-4 w-4" /> {t("email")}
        </button>
        <button type="button" onClick={() => changeMethod("phone")} className={`flex h-11 items-center justify-center gap-2 rounded-md text-xs font-black ${method === "phone" ? "bg-canvas text-brand shadow-sm" : "text-muted"}`}>
          <Phone className="h-4 w-4" /> {t("phone")}
        </button>
      </div>

      {isSignUp && (
        <div className="mt-5">
          <label className="form-label">{t("fullName")}</label>
          <div className="relative">
            <UserRound className="input-icon" />
            <input required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="form-input pl-11" placeholder={t("fullName")} />
          </div>
        </div>
      )}

      {method === "email" ? (
        <>
          <div className="mt-5">
            <label className="form-label">{t("email")}</label>
            <div className="relative">
              <Mail className="input-icon" />
              <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="form-input pl-11" placeholder="you@example.com" />
            </div>
          </div>
          <div className="mt-4">
            <label className="form-label">{t("password")}</label>
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
        </>
      ) : (
        <>
          <div className="mt-5">
            <label className="form-label">{t("phone")}</label>
            <div className="relative">
              <Phone className="input-icon" />
              <input required type="tel" autoComplete="tel" disabled={otpSent} value={phone} onChange={(event) => setPhone(event.target.value)} className="form-input pl-11 disabled:opacity-65" placeholder="+250 78 123 4567" />
            </div>
          </div>
          {otpSent && (
            <div className="mt-4">
              <label className="form-label">{t("verificationCode")}</label>
              <input required inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className="form-input text-center text-lg font-black tracking-[.35em]" placeholder="123456" />
              <button type="button" onClick={() => { setOtpSent(false); setOtp(""); setNotice(""); }} className="mt-2 text-xs font-bold text-brand">{t("changePhone")}</button>
            </div>
          )}
        </>
      )}

      {authError && <p role="alert" className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-xs font-bold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{authError}</p>}
      {notice && <p className="mt-4 flex items-center gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-xs font-bold text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200"><CheckCircle2 className="h-4 w-4" /> {notice}</p>}

      <button disabled={loading || (Boolean(notice) && method === "email")} className="button-primary mt-6 w-full disabled:opacity-60">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading
          ? t("verifying")
          : method === "phone" && !otpSent
            ? t("sendCode")
            : method === "phone"
              ? t("verifyCode")
              : isSignUp
                ? t("signup")
                : t("signin")}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>

      {!isSignUp && method === "email" && (
        <div className="mt-5 rounded-lg border border-line p-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-black">
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

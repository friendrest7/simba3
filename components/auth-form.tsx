"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "./store-provider";
import { branches } from "@/lib/data";

type AuthMethod = "email" | "phone";
type Role = "client" | "admin" | "manager" | "driver" | "ceo";

const dashboardRoles: Record<string, Role> = {
  client: "client",
  driver: "driver",
  manager: "manager",
  admin: "admin",
  ceo: "ceo",
};

const roleLabels: Record<Role, string> = {
  client: "Customer",
  driver: "Driver",
  manager: "Branch manager",
  admin: "General manager",
  ceo: "Africa CEO",
};

const demoStaffCredentials: Record<Exclude<Role, "client">, { email: string; password: string }> = {
  driver: { email: "driver@simba.market", password: "simba123" },
  manager: { email: "manager@simba.market", password: "simba123" },
  admin: { email: "admin@simba.market", password: "simba123" },
  ceo: { email: "ceo@simba.market", password: "simba123" },
};

const demoAccounts: Array<{ role: Role; label: string; email: string; password: string }> = [
  { role: "client", label: "Customer", email: "client@simba.market", password: "simba123" },
  { role: "driver", label: "Driver", ...demoStaffCredentials.driver },
  { role: "manager", label: "Branch manager", ...demoStaffCredentials.manager },
  { role: "admin", label: "General manager", ...demoStaffCredentials.admin },
  { role: "ceo", label: "Africa CEO", ...demoStaffCredentials.ceo },
];

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.32 2.98-7.39Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.42l-3.24-2.53c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.88A6.02 6.02 0 0 1 6.07 12c0-.65.11-1.29.32-1.88V7.51H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.49l3.35-2.61Z" />
      <path fill="#EA4335" d="M12 5.99c1.47 0 2.79.51 3.83 1.5l2.88-2.88A9.67 9.67 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.61C7.18 7.75 9.39 5.99 12 5.99Z" />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const { signIn } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const destination = params.get("next");
  const requestedRole = dashboardRoles[destination?.split("/").filter(Boolean).at(-1) || ""] || "client";
  const staffLogin = requestedRole !== "client";
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState(staffLogin ? demoStaffCredentials[requestedRole as Exclude<Role, "client">].email : "client@simba.market");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [branchId, setBranchId] = useState("kigali-kic");
  const [password, setPassword] = useState(staffLogin ? demoStaffCredentials[requestedRole as Exclude<Role, "client">].password : "simba123");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isSignUp = mode === "signup";
  const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  async function finishSignIn(identity: string, selectedRole: Role = "client") {
    signIn(identity, selectedRole, branchId);
    try {
      await fetch("/api/auth/signin-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identity, role: selectedRole }),
      });
    } catch {
      // Email delivery must never prevent access to the account.
    }
    router.push(destination || `/dashboard/${selectedRole}`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");

    if (staffLogin) {
      setAuthLoading(true);
      try {
        const response = await fetch("/api/auth/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role: requestedRole }),
        });
        const data = await response.json();
        if (!response.ok) {
          setAuthError(data.error || "Staff access could not be verified.");
          return;
        }
        await finishSignIn(data.email, data.role);
      } catch {
        setAuthError("Staff authentication is temporarily unavailable.");
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    if (method === "email") {
      const matchedStaff = (Object.entries(demoStaffCredentials) as Array<[Exclude<Role, "client">, { email: string; password: string }]>)
        .find(([, credential]) => credential.email === email.trim().toLowerCase());
      if (matchedStaff) {
        const [role] = matchedStaff;
        setAuthLoading(true);
        try {
          const response = await fetch("/api/auth/staff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role }),
          });
          const data = await response.json();
          if (!response.ok) {
            setAuthError(data.error || "These credentials could not be verified.");
            return;
          }
          await finishSignIn(data.email, data.role);
        } catch {
          setAuthError("Authentication is temporarily unavailable.");
        } finally {
          setAuthLoading(false);
        }
        return;
      }
      if (email.trim().toLowerCase() === "client@simba.market" && password !== "simba123") {
        setAuthError("Incorrect password for the customer demo account.");
        return;
      }
    }

    if (method === "phone") {
      if (!otpSent) {
        setOtpSent(true);
        return;
      }
      if (otp.length < 4) return;
      await finishSignIn(`${phone.replace(/\D/g, "") || "mobile"}@phone.simba`);
      return;
    }
    await finishSignIn(email, "client");
  }

  function continueWithGoogle() {
    setGoogleLoading(true);

    if (googleAuthEnabled) {
      const next = destination ? `?callbackUrl=${encodeURIComponent(destination)}` : "";
      window.location.href = `/api/auth/signin/google${next}`;
      return;
    }

    window.setTimeout(async () => {
      setGoogleLoading(false);
      await finishSignIn("google.customer@gmail.com", "client");
    }, 500);
  }

  function selectDemoAccount(account: (typeof demoAccounts)[number]) {
    setMethod("email");
    setEmail(account.email);
    setPassword(account.password);
    setAuthError("");
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <span className="eyebrow">{staffLogin ? `${roleLabels[requestedRole]} access` : isSignUp ? "Join the marketplace" : "Welcome back"}</span>
      <h1 className="mt-4 text-4xl font-black tracking-tight">
        {staffLogin ? `Sign in as ${roleLabels[requestedRole]}` : isSignUp ? "Create your Simba account" : "Sign in to Simba"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        {staffLogin
          ? "Staff access is assigned by Simba management and verified separately from customer accounts."
          : isSignUp
          ? "Start shopping, selling, and tracking deliveries in minutes."
          : "Signing in is optional while browsing and required only when you checkout or open a dashboard."}
      </p>

      {!isSignUp && !staffLogin && (
        <section className="mt-6 rounded-md border border-line bg-black/[.025] p-4 dark:bg-white/[.04]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black">Default test accounts</p>
              <p className="mt-1 text-[10px] text-muted">Select an account to fill the sign-in form.</p>
            </div>
            <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-black text-brand">Password: simba123</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {demoAccounts.map((account) => (
              <button
                type="button"
                key={account.role}
                onClick={() => selectDemoAccount(account)}
                className={`rounded-md border p-3 text-left transition ${
                  email.trim().toLowerCase() === account.email
                    ? "border-brand bg-brand/10"
                    : "border-line bg-canvas hover:border-brand/40"
                }`}
              >
                <span className="block text-[10px] font-black uppercase text-brand">{account.label}</span>
                <span className="mt-1 block truncate text-[11px] font-bold">{account.email}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {staffLogin && (
        <div className="mt-5 rounded-md border border-[#16865c]/25 bg-[#16865c]/10 p-4 text-xs text-[#116344]">
          <p className="font-black">Demo staff access is ready</p>
          <p className="mt-1 leading-5">The correct {roleLabels[requestedRole].toLowerCase()} credentials are filled in. Select a branch where applicable, then open the dashboard.</p>
        </div>
      )}

      {!staffLogin && <button
        type="button"
        onClick={continueWithGoogle}
        disabled={googleLoading}
        className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-white text-sm font-bold text-[#3c4043] shadow-sm transition hover:bg-[#f8faff] hover:shadow-md disabled:cursor-wait"
      >
        {googleLoading ? <Loader2 className="h-5 w-5 animate-spin text-[#4285f4]" /> : <GoogleMark />}
        {googleLoading ? "Connecting to Google..." : "Continue with Google"}
      </button>}

      {!staffLogin && <div className="my-6 flex items-center gap-3 text-[10px] font-black uppercase text-muted">
        <span className="h-px flex-1 bg-line" /> or continue with <span className="h-px flex-1 bg-line" />
      </div>}

      {!staffLogin && <div className="grid grid-cols-2 gap-2 rounded-md bg-black/[.045] p-1 dark:bg-white/[.07]">
        <button
          type="button"
          onClick={() => setMethod("email")}
          className={`flex h-10 items-center justify-center gap-2 rounded-md text-xs font-bold transition ${method === "email" ? "bg-white text-[#d94b1b] shadow-sm dark:bg-[#2b2c31]" : "text-muted"}`}
        >
          <Mail className="h-4 w-4" /> Email
        </button>
        <button
          type="button"
          onClick={() => setMethod("phone")}
          className={`flex h-10 items-center justify-center gap-2 rounded-md text-xs font-bold transition ${method === "phone" ? "bg-white text-[#16865c] shadow-sm dark:bg-[#2b2c31]" : "text-muted"}`}
        >
          <Phone className="h-4 w-4" /> Phone number
        </button>
      </div>}

      {isSignUp && (
        <div className="mt-6">
          <label className="form-label">Full name</label>
          <input required className="form-input" placeholder="Your full name" />
        </div>
      )}

      {staffLogin || method === "email" ? (
        <>
          <div className="mt-5">
            <label className="form-label">Email address</label>
            <div className="relative">
              <Mail className="input-icon" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input pl-11" />
            </div>
          </div>
          <div className="mt-4">
            <label className="form-label">Password</label>
            <div className="relative">
              <LockKeyhole className="input-icon" />
              <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="form-input px-11" autoComplete="current-password" />
              <Eye className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mt-5">
            <label className="form-label">Mobile phone number</label>
            <div className="relative">
              <Phone className="input-icon" />
              <input
                required
                type="tel"
                value={phone}
                disabled={otpSent}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input pl-11 disabled:opacity-65"
                placeholder="+250 78 123 4567"
              />
            </div>
          </div>
          {otpSent && (
            <div className="mt-4">
              <label className="form-label">Verification code</label>
              <input
                required
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="form-input text-center text-lg font-black tracking-[.35em]"
                placeholder="123456"
              />
              <p className="mt-2 flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Demo code sent. Enter any 4-6 digits.
              </p>
            </div>
          )}
        </>
      )}

      {staffLogin && (requestedRole === "manager" || requestedRole === "driver") && (
        <div className="mt-4">
          <label className="form-label">{requestedRole === "manager" ? "Assigned manager branch" : "Assigned driver branch"}</label>
          <select value={branchId} onChange={(event) => setBranchId(event.target.value)} className="form-input">
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name} · {branch.city}</option>)}
          </select>
          <p className="mt-2 text-[11px] text-muted">Access is restricted to this location after sign in.</p>
        </div>
      )}

      {authError && <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{authError}</p>}

      <button disabled={authLoading} className="button-primary mt-6 w-full disabled:opacity-60">
        {authLoading
          ? "Verifying staff access..."
          : method === "phone" && !otpSent && !staffLogin
          ? "Send verification code"
          : staffLogin
            ? `Open ${roleLabels[requestedRole]} dashboard`
          : isSignUp
            ? "Create account"
            : "Sign in securely"}
        <ArrowRight className="h-4 w-4" />
      </button>

      {!staffLogin && otpSent && (
        <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }} className="mt-3 w-full text-xs font-bold text-muted hover:text-brand">
          Change phone number
        </button>
      )}

      {!staffLogin && <p className="mt-6 text-center text-sm text-muted">
        {isSignUp ? "Already have an account?" : "New to Simba?"}{" "}
        <Link href={isSignUp ? "/signin" : "/signup"} className="font-bold text-brand">
          {isSignUp ? "Sign in" : "Create account"}
        </Link>
      </p>}
    </form>
  );
}

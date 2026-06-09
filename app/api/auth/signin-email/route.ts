import { NextResponse } from "next/server";

type Role = "client" | "driver" | "manager" | "admin";

const roleLabels: Record<Role, string> = {
  client: "customer",
  driver: "driver",
  manager: "branch manager",
  admin: "general manager",
};

const recentSends = new Map<string, number>();

function validEmail(value: unknown): value is string {
  return typeof value === "string"
    && value.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body?.role as Role;

  if (!validEmail(email) || !roleLabels[role]) {
    return NextResponse.json({ error: "A valid email and role are required." }, { status: 400 });
  }

  const lastSent = recentSends.get(email) || 0;
  if (Date.now() - lastSent < 60_000) {
    return NextResponse.json({ sent: false, reason: "recently-sent" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    return NextResponse.json({ sent: false, reason: "email-not-configured" }, { status: 202 });
  }

  const signedInAt = new Intl.DateTimeFormat("en-RW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Kigali",
  }).format(new Date());
  const roleLabel = roleLabels[role];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `simba-signin-${role}-${email}-${Math.floor(Date.now() / 60_000)}`,
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "New sign-in to your Simba account",
      text: `Hello,\n\nYour Simba ${roleLabel} account signed in successfully on ${signedInAt}.\n\nIf this was not you, change your password and contact Simba support immediately.\n\nSimba Supermarket Rwanda`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#202124">
        <div style="background:#d94b1b;padding:22px;color:white"><strong style="font-size:20px">Simba Supermarket Rwanda</strong></div>
        <div style="padding:28px;border:1px solid #e5e7eb;border-top:0">
          <h1 style="font-size:22px;margin:0 0 16px">Sign-in successful</h1>
          <p style="line-height:1.6">Your Simba <strong>${roleLabel}</strong> account signed in successfully.</p>
          <p style="line-height:1.6"><strong>Time:</strong> ${signedInAt}</p>
          <p style="line-height:1.6;color:#5f6368">If this was not you, change your password and contact Simba support immediately.</p>
        </div>
      </div>`,
      tags: [{ name: "event", value: "signin" }, { name: "role", value: role }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Sign-in email failed:", response.status, error);
    return NextResponse.json({ sent: false, reason: "provider-error" }, { status: 502 });
  }

  recentSends.set(email, Date.now());
  return NextResponse.json({ sent: true });
}

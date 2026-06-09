import { NextResponse } from "next/server";

type StaffRole = "driver" | "manager" | "admin";

const demoPassword = "simba123";
const staffCredentials: Record<StaffRole, { email: string; password: string }> = {
  driver: {
    email: process.env.STAFF_DRIVER_EMAIL || "driver@simba.market",
    password: process.env.STAFF_DRIVER_PASSWORD || demoPassword,
  },
  manager: {
    email: process.env.STAFF_MANAGER_EMAIL || "manager@simba.market",
    password: process.env.STAFF_MANAGER_PASSWORD || demoPassword,
  },
  admin: {
    email: process.env.STAFF_GENERAL_MANAGER_EMAIL || "admin@simba.market",
    password: process.env.STAFF_GENERAL_MANAGER_PASSWORD || demoPassword,
  },
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role as StaffRole;
  const credential = staffCredentials[role];

  if (!credential || !["driver", "manager", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid staff portal." }, { status: 400 });
  }
  if (email !== credential.email.toLowerCase() || password !== credential.password) {
    return NextResponse.json({ error: "These credentials do not have access to this dashboard." }, { status: 403 });
  }

  return NextResponse.json({ role, email });
}

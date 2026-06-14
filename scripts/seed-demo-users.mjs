import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadLocalEnvironment() {
  try {
    const contents = readFileSync(".env.local", "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // Production and CI environments provide variables directly.
  }
}

loadLocalEnvironment();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and a Supabase service role key are required.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const demoAccounts = [
  {
    email: "buyer@test.com",
    password: "password123",
    fullName: "Demo Buyer",
    phone: "+250788000101",
    role: "customer",
  },
  {
    email: "admin@test.com",
    password: "admin123",
    fullName: "Demo Market Admin",
    phone: "+250788000102",
    role: "admin",
  },
];

async function findUserByEmail(email) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match || data.users.length < 100) return match || null;
  }
  return null;
}

for (const account of demoAccounts) {
  const existing = await findUserByEmail(account.email);
  let userId = existing?.id;

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: account.password,
      email_confirm: true,
      user_metadata: {
        ...existing.user_metadata,
        full_name: existing.user_metadata?.full_name || account.fullName,
        phone: existing.user_metadata?.phone || account.phone,
        demo_account: true,
      },
    });
    if (error) throw error;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.fullName,
        phone: account.phone,
        demo_account: true,
      },
    });
    if (error || !data.user) throw error || new Error(`Could not create ${account.email}.`);
    userId = data.user.id;
  }

  const { data: profile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", userId)
    .maybeSingle();
  if (profileLookupError) throw profileLookupError;

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email: account.email,
    full_name: profile?.full_name || account.fullName,
    phone: profile?.phone || account.phone,
    role: account.role,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
  if (profileError) throw profileError;

  console.log(`${existing ? "Updated" : "Created"} ${account.email} as ${account.role}; existing users were preserved.`);
}

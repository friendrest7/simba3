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

const buyer = await findUserByEmail("buyer@test.com");
if (buyer) {
  const { data: existingOrders, error: existingOrderError } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", buyer.id)
    .limit(1);
  if (!existingOrderError && !existingOrders?.length) {
    const demoOrders = [
      {
        user_id: buyer.id,
        branch_id: "kigali-kic",
        status: "delivered",
        subtotal_rwf: 23_800,
        delivery_fee_rwf: 2_000,
        total_rwf: 25_800,
        delivery_address: {
          fulfilment: "delivery",
          district: "Nyarugenge",
          address: "KN 4 Avenue, Kigali",
          phone: "+250788000101",
          slot: "12:00 - 15:00",
        },
        payment_method: "mtn_momo",
      },
      {
        user_id: buyer.id,
        branch_id: "kigali-heights",
        status: "on_the_way",
        subtotal_rwf: 17_600,
        delivery_fee_rwf: 2_500,
        total_rwf: 20_100,
        delivery_address: {
          fulfilment: "delivery",
          district: "Gasabo",
          address: "KG 7 Avenue, Kimihurura",
          phone: "+250788000101",
          slot: "15:00 - 18:00",
        },
        payment_method: "airtel_money",
      },
    ];
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .insert(demoOrders)
      .select("id, order_number");
    if (orderError) throw orderError;
    const itemSets = [
      [
        { product_name: "Baba Noor Basmati Rice 5kg", unit_price_rwf: 14_800, quantity: 1 },
        { product_name: "Inyange milk 1L", unit_price_rwf: 4_500, quantity: 2 },
      ],
      [
        { product_name: "Boni Selection Floor-Cloth Nat. 60X70 3P", unit_price_rwf: 8_600, quantity: 1 },
        { product_name: "Belle France Toilet Paper decore 6X", unit_price_rwf: 4_500, quantity: 2 },
      ],
    ];
    for (let index = 0; index < (orders || []).length; index += 1) {
      const order = orders[index];
      const { error: itemError } = await supabase.from("order_items").insert(
        itemSets[index].map((item) => ({ ...item, order_id: order.id })),
      );
      if (itemError) throw itemError;
    }
    console.log("Created non-destructive buyer demo order history.");
  } else {
    console.log("Buyer already has order history; no demo orders were added.");
  }
}

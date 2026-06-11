import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const roleRoutes: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/dashboard/client", roles: ["customer"] },
  { prefix: "/dashboard/manager", roles: ["manager"] },
  { prefix: "/dashboard/admin", roles: ["admin"] },
  { prefix: "/shop/admin", roles: ["admin", "manager"] },
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const protectedRoute = pathname === "/checkout"
    || pathname.startsWith("/dashboard/")
    || pathname.startsWith("/shop/admin");

  if (!user && protectedRoute) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (user) {
    const rule = roleRoutes.find(({ prefix }) => pathname.startsWith(prefix));
    if (rule) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      const role = profile?.role || user.user_metadata?.role || "customer";
      if (!rule.roles.includes(role)) {
        return NextResponse.redirect(new URL(role === "customer" ? "/dashboard/client" : `/dashboard/${role}`, request.url));
      }
    }
  }

  return response;
}


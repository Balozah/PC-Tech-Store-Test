import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const configured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!configured) {
    // Supabase not connected yet (TODO in brief) — let the dashboard itself
    // show the "connect Supabase" notice instead of redirect-looping.
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims verifies the ES256 session JWT locally against the cached JWKS,
  // so this check costs no round-trip to Supabase Auth on every request.
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  const isLoginPage = request.nextUrl.pathname === "/dashboard/login";

  let isAdmin = false;
  if (userId) {
    const { data } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    isAdmin = Boolean(data);
  }

  if (!isAdmin && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/login";
    return NextResponse.redirect(url);
  }

  if (isAdmin && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

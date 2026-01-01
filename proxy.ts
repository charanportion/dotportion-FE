import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeToken(token: string): { exp: number } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, "base64")
        .toString()
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp <= currentTime + 60;
}
function isMobileOrTablet(request: NextRequest): boolean {
  const ua = request.headers.get("user-agent") || "";
  return /mobile|android|iphone|ipad|ipod|tablet/i.test(ua);
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isMobile = isMobileOrTablet(request);

  // Routes that REQUIRE desktop
  const desktopOnlyRoutes = [
    "/dashboard",
    "/projects",
    "/workflows",
    "/settings",
    "/profile",
    "/secrets",
  ];

  const isDesktopOnlyRoute = desktopOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Route definitions
  const protectedRoutes = [
    "/dashboard",
    "/projects",
    "/workflows",
    "/settings",
    "/profile",
    "/secrets",
  ];
  const authRoutes = ["/auth/signin", "/auth/signup", "/auth/forgot-password"];

  // Get auth state from cookies
  const token = request.cookies.get("auth-token")?.value;
  const isVerified = request.cookies.get("auth-verified")?.value === "true";
  const isNewUserCookie =
    request.cookies.get("auth-is-new-user")?.value === "true";
  const hasValidToken = token && !isTokenExpired(token);
  const accessStatus = request.cookies.get("auth-access-status")?.value;

  // === PROTECTED ROUTES (dashboard, projects, etc.) ===
  // Requires: valid token AND verified AND NOT new user (completed onboarding)
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute) {
    if (!hasValidToken) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (!isVerified) {
      return NextResponse.redirect(new URL("/auth/verify-otp", request.url));
    }
    // If new user, redirect to onboarding
    if (isNewUserCookie) {
      return NextResponse.redirect(new URL("/onboarding?step=0", request.url));
    }

    // 🚫 Block mobile/tablet ONLY for desktop-only routes
    if (isMobile && isDesktopOnlyRoute) {
      if (accessStatus === "none") {
        return NextResponse.redirect(new URL("/request-access", request.url));
      }

      if (accessStatus === "requested") {
        return NextResponse.redirect(
          new URL("/request-access/pending", request.url)
        );
      }

      if (accessStatus === "rejected") {
        return NextResponse.redirect(
          new URL("/request-access/rejected", request.url)
        );
      }
      return NextResponse.redirect(
        new URL("/mobile-not-supported", request.url)
      );
    }

    // 🔄 Auto-exit fallback page on desktop
    if (!isMobile && pathname === "/mobile-not-supported") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // NEW LOGIC: Access gating
    if (accessStatus === "none") {
      return NextResponse.redirect(new URL("/request-access", request.url));
    }

    if (accessStatus === "requested") {
      return NextResponse.redirect(
        new URL("/request-access/pending", request.url)
      );
    }

    if (accessStatus === "rejected") {
      return NextResponse.redirect(
        new URL("/request-access/rejected", request.url)
      );
    }
    return NextResponse.next();
  }

  // === ONBOARDING ===
  // Requires: valid token AND verified AND is new user
  if (pathname.startsWith("/onboarding")) {
    if (!hasValidToken) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    if (!isVerified) {
      return NextResponse.redirect(new URL("/auth/verify-otp", request.url));
    }
    // If not new user (completed onboarding), redirect to dashboard
    if (!isNewUserCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // REQUEST ACCESS ROUTES SHOULD ONLY BE VISIBLE TO VALID USERS
  if (pathname.startsWith("/request-access")) {
    if (!hasValidToken || !isVerified || isNewUserCookie) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    return NextResponse.next();
  }

  // === VERIFY OTP PAGE ===
  if (pathname.startsWith("/auth/verify-otp")) {
    const hasEmail = searchParams.has("email");
    const isResetFlow = searchParams.get("isreset") === "true";

    // If already fully authenticated and not in reset flow
    if (hasValidToken && isVerified && !isResetFlow) {
      if (isNewUserCookie) {
        return NextResponse.redirect(
          new URL("/onboarding?step=0", request.url)
        );
      }

      if (accessStatus === "none") {
        return NextResponse.redirect(new URL("/request-access", request.url));
      }

      if (accessStatus === "requested") {
        return NextResponse.redirect(
          new URL("/request-access/pending", request.url)
        );
      }

      if (accessStatus === "rejected") {
        return NextResponse.redirect(
          new URL("/request-access/rejected", request.url)
        );
      }

      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Allow access if has email param or valid token
    if (hasEmail || hasValidToken) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/auth/signup", request.url));
  }

  // === RESET PASSWORD PAGE ===
  if (pathname.startsWith("/auth/reset-password")) {
    const hasEmail = searchParams.has("email");
    if (hasEmail) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth/forgot-password", request.url));
  }

  // === AUTH ROUTES (signin, signup, forgot-password) ===
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute) {
    if (hasValidToken && isVerified) {
      if (isNewUserCookie) {
        return NextResponse.redirect(
          new URL("/onboarding?step=0", request.url)
        );
      }

      if (accessStatus === "none") {
        return NextResponse.redirect(new URL("/request-access", request.url));
      }

      if (accessStatus === "requested") {
        return NextResponse.redirect(
          new URL("/request-access/pending", request.url)
        );
      }

      if (accessStatus === "rejected") {
        return NextResponse.redirect(
          new URL("/request-access/rejected", request.url)
        );
      }

      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // === ROOT PATH ===
  if (pathname === "/") {
    if (hasValidToken && isVerified) {
      if (isNewUserCookie) {
        return NextResponse.redirect(
          new URL("/onboarding?step=0", request.url)
        );
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};

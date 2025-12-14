import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token, isNewUser } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const expiresDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const response = NextResponse.json({ success: true });

    // Same cookie pattern as /api/auth/login and /api/auth/verify-otp
    response.cookies.set("auth-token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: expiresDate,
    });

    response.cookies.set("auth-verified", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: expiresDate,
    });

    response.cookies.set("auth-is-new-user", String(!!isNewUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: expiresDate,
    });

    return response;
  } catch (error) {
    console.error("OAuth session API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

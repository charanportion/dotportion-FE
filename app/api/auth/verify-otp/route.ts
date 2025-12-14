// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "OTP verification failed" },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(data);

    if (data.token) {
      const expiresDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Set auth-token as NON-httpOnly so axios interceptor can read it
      nextResponse.cookies.set("auth-token", data.token, {
        httpOnly: false, // <-- Changed to false so client can read it
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: expiresDate,
      });

      nextResponse.cookies.set("auth-verified", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: expiresDate,
      });

      const isNewUser = data.user?.isNewUser ?? true;
      nextResponse.cookies.set("auth-is-new-user", String(isNewUser), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: expiresDate,
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Verify OTP API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// app/api/auth/complete-onboarding/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Try to update backend (optional - adjust endpoint as needed)
    try {
      await fetch(`${BACKEND_URL}/users/complete-onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Continue even if backend call fails
    }

    const nextResponse = NextResponse.json({
      message: "Onboarding completed",
      isNewUser: false,
    });

    const expiresDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update isNewUser cookie to false
    nextResponse.cookies.set("auth-is-new-user", "false", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: expiresDate,
    });

    return nextResponse;
  } catch (error) {
    console.error("Complete onboarding API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

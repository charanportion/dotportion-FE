// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        const nextResponse = NextResponse.json(
          { error: "Session expired" },
          { status: 401 }
        );
        // Clear all cookies on auth failure
        nextResponse.cookies.delete("auth-token");
        nextResponse.cookies.delete("auth-verified");
        nextResponse.cookies.delete("auth-is-new-user");
        return nextResponse;
      }

      return NextResponse.json(
        { error: data.message || "Failed to get user details" },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(data);
    const expiresDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Sync cookies with backend state
    if (data.isVerified !== undefined) {
      nextResponse.cookies.set("auth-verified", String(data.isVerified), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: expiresDate,
      });
    }

    if (data.isNewUser !== undefined) {
      nextResponse.cookies.set("auth-is-new-user", String(data.isNewUser), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: expiresDate,
      });
    }

    if (data.access?.status !== undefined) {
      nextResponse.cookies.set("auth-access-status", data.access.status, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: expiresDate,
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Get user API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

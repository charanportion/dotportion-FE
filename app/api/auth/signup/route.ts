// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Signup failed" },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(data);
    const expiresDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (data.user?.access?.status !== undefined) {
      nextResponse.cookies.set("auth-access-status", data.user.access.status, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: expiresDate,
      });
    }

    // Signup doesn't return a token - just pass through the response
    return nextResponse;
  } catch (error) {
    console.error("Signup API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

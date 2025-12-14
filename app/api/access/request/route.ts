import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/access/request`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Request failed" },
        { status: response.status }
      );
    }

    const meResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const meData = await meResponse.json();

    const next = NextResponse.json(data);
    const expires = new Date(Date.now() + 86400000);

    if (meData.access?.status) {
      next.cookies.set("auth-access-status", meData.access.status, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires,
      });
    }

    return next;
  } catch (error) {
    console.error("Request access error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

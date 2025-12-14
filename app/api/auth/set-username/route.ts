import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, username } = await req.json();

    if (!email || !username) {
      return NextResponse.json(
        { error: "Email and username required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/username`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const response = NextResponse.json({
      success: true,
      user: data.user,
    });

    // Set new token
    response.cookies.set("auth-token", data.token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires,
    });

    response.cookies.set("auth-verified", "true", {
      httpOnly: false,
      sameSite: "strict",
      path: "/",
      expires,
    });

    response.cookies.set("auth-is-new-user", "true", {
      httpOnly: false,
      sameSite: "strict",
      path: "/",
      expires,
    });

    return response;
  } catch (err) {
    console.error("set-username API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

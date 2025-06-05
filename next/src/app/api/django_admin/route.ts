import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "api/auth/admin/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const data = await res.json();

  console.log(data, res.headers, "ZXC");

  const response = NextResponse.json({ ...data });

  response.cookies.set("CSRF_TOKEN", data.token, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}

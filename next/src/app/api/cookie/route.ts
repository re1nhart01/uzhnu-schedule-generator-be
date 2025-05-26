import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json();

  const cookieStore = await cookies();

  cookieStore.set("access_token", access_token, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set("refresh_token", refresh_token, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ success: true });
}

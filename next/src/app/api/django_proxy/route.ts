// app/api/admin-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("csrftoken")?.value;

  const proxyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}admin/`, {
    headers: {
      Cookie: `csrftoken=${token}`,
    },
  });

  const html = await proxyRes.text();

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}

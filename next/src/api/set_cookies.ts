export async function login(access_token: string, refresh_token: string) {
  const res = await fetch("/api/cookie", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ access_token, refresh_token }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
}

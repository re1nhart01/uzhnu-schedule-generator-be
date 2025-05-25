export const connectToDjangoAdmin = async (login: string, password: string) => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "api/admin/login/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFTOKEN": process.env.NEXT_PUBLIC_CSRF_TOKEN,
      },
      body: JSON.stringify({ login, password }),
    },
  );

  if (!res.ok) {
    throw new Error("Login failed");
  }

  console.log(await res.json());

  return res.json();
};

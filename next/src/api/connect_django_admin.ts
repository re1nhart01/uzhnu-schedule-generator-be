
export const connectToDjangoAdmin = async (email: string, password: string): Promise<{ success: boolean; message: string; }> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/auth/admin/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });


    const data = await response.json()

    return data;
  } catch (e) {
    return { success: false, message: e?.toString() ?? "Unexpected Error" }
  }
};

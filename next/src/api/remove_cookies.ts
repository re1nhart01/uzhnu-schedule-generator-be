export const logout = async () => {
  await fetch("/api/remove_cookies", {
    method: "POST",
    credentials: "include",
  });
};

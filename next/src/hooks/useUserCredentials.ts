"use client";

import { useCallback, useEffect, useState } from "react";

export const useUserCredentials = (tokenFromCookies = "") => {
  const [access, setAccess] = useState("");
  const [refresh, setRefresh] = useState("");

  useEffect(() => {
    const data = sessionStorage.getItem("USER_DATA");
    if (data) {
      const { access_token, refresh_token } = JSON.parse(data);
      setAccess(access_token);
      setRefresh(refresh_token);
    }
    if (tokenFromCookies) {
        setAccess(tokenFromCookies);
    }

  }, [tokenFromCookies]);

  const removeItems = useCallback(() => {
    sessionStorage.removeItem("USER_DATA");
    setRefresh("");
    setAccess("");
  }, []);

  return {
    access,
    refresh,
    removeItems,
  };
};

export function getUserDataOutOfReact() {
  const data = sessionStorage.getItem("USER_DATA");
  if (data) {
    const { access_token, refresh_token } = JSON.parse(data);
    return { access_token, refresh_token };
  }

  return { access_token: null, refresh_token: null };
}

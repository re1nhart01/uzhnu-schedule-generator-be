import { useEffect, useState } from "react";

export const useUserCredentials = () => {
  const [access, setAccess] = useState("");
  const [refresh, setRefresh] = useState("");

  useEffect(() => {
    const data = sessionStorage.getItem("USER_DATA");
    if (data) {
      const { access_token, refresh_token } = JSON.parse(data);
      setAccess(access);
      setRefresh(refresh);
    }
  }, []);

  return {
    access,
    refresh,
  };
};

export function getDataOutOfReact() {
  const data = sessionStorage.getItem("USER_DATA");
  if (data) {
    const { access_token, refresh_token } = JSON.parse(data);
    return { access_token, refresh_token };
  }
}

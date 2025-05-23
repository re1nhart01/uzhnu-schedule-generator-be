import axios, { type AxiosRequestHeaders } from "axios";
import { assoc, defaultTo, isNil, pipe } from "ramda";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
console.log("API Base URL:", process.env.NEXT_PUBLIC_API_URL);

let counterToLogout = 0;
const maxCountToLogout = 2;

type AxiosCustomHeaderType = Record<"Authorization", string> &
  Omit<
    Record<"Content-Type", string> & Omit<AxiosRequestHeaders, "Content-Type">,
    "Authorization"
  >;

export const newAbortSignal = (timeoutMs: number) => {
  if (typeof window === "undefined") return undefined; // SSR-safe
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs || 0);
  return abortController.signal;
};

axios.interceptors.request.use(
  (config) => {

    const access_token = "";
    if (access_token && isNil(config.headers?.Authorization)) {
      (<AxiosCustomHeaderType>config.headers) = pipe(
        assoc(
          "Content-Type",
          defaultTo("application/json", config.headers?.getContentType?.())
        ),
        assoc("Authorization", `Bearer ${access_token}`)
      )(config.headers);
    }

    return {
      ...config,
      signal: defaultTo(newAbortSignal(15000), config.signal),
    };
  },
  (error) => Promise.reject(error),
);

axios.interceptors.response.use(
  (response) => {
    counterToLogout = 0;
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      counterToLogout++;
      if (counterToLogout >= maxCountToLogout) {
        // Optional logout or redirect
      }
    }
    return Promise.reject(error);
  },
);

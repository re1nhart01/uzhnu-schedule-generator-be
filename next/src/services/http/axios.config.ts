import type { AxiosRequestHeaders } from "axios";
import axios from "axios";
import { assoc, defaultTo, isNil, pipe } from "ramda";

// import store from "store/store";

axios.defaults.baseURL = process.env.BASE_URL;
let counterToLogout = 0;
const maxCountToLogout = 2;

type AxiosCustomHeaderType = Record<"Authorization", string> &
  Omit<
    Record<"Content-Type", string | RegExpExecArray> &
      Omit<AxiosRequestHeaders, "Content-Type">,
    "Authorization"
  >;

export const newAbortSignal = (timeoutMs: number) => {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs || 0);
  return abortController.signal;
};

axios.interceptors.request.use(
  async (config) => {
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

    return assoc(
      "signal",
      defaultTo(newAbortSignal(15000), config.signal),
      config
    );
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => {
    counterToLogout = 0;
    return response;
  },
  (error) => {

    return Promise.reject(error);
  }
);

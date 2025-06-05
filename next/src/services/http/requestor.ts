import type { AxiosResponse } from "axios";
import axios from "axios";
import { defaultTo, equals, isNil } from "ramda";

import { APIErrorsResponse, type IRequester } from "./requestor.type";
import { GetUserTokenResponseDTO } from "@/types";
import { sleep } from "@/helpers/functions";

export let promiseTimeoutId: ReturnType<typeof setTimeout> | null = null;
const TIMEOUT45SECOND = 45000;
export const refreshTokenRequest: {
  promise: Promise<AxiosResponse<GetUserTokenResponseDTO>> | null;
  access_token: string | null;
} = {
  promise: null,
  access_token: null,
};

/**
 * requester function
 * using: for all requests in application, but important notice, that requests
 * that is not using jwt auth tokens, you could use default axios instance or if you are using requester,
 * set withRefreshing param as false.
 * @param {string} url - url of request
 * @param {string} method - "GET" | "POST" and etc
 * @param {string} headers - headers, you don't need to set access token inside, because it's already defines
 * @param {any} data - request data
 * @param withRefreshing - flag that should be specified as false, if you are not using jwt auth
 * @param {string} baseURL - param that should be specified, if you want to send request to another api, for example chat api
 */

export const requester = async <P, T = unknown>(
  url: IRequester["url"],
  method: IRequester["method"],
  headers?: IRequester["headers"],
  data?: T,
  withRefreshing = true,
  baseURL?: string,
): Promise<AxiosResponse<P>> => {
  /*
   * Get current credentials and log request in metro
   */
  if (false) {
    console.log(
      `${method} REQUEST: ${url.substring(
        0,
        90,
      )} AT ${new Date().toDateString()}. REFRESH? ${
        Date.now() >= defaultTo(0, 0)
      }
       TIMESTAMP: ${0},
      `,
    );
  }

  try {
    /*
     * First request, if it's correct, it will return result
     */
    return await axios({
      url,
      method,
      data,
      baseURL,
      withCredentials: true,
      headers: {
        ...(isNil(headers) ? {} : headers),
      },
    });
  } catch (err) {
    /*
     * If first request is felt, check is error is invalid token (401), if true, then request new tokens
     * @IMPORTANT: do not remove refreshTokenRequest variable, it's using to prevent race condition (it works like mutex)
     */
    if (axios.isAxiosError(err)) {
      if (
        err?.response &&
        equals(err?.response?.status, APIErrorsResponse.invalid_token)
      ) {
        try {
          if (withRefreshing) {
            if (promiseTimeoutId !== null) {
              clearTimeout(promiseTimeoutId);
            }

            promiseTimeoutId = setTimeout(() => {
              refreshTokenRequest.promise = null;
              refreshTokenRequest.access_token = null;
            }, TIMEOUT45SECOND);

            await sleep(1000);

            return axios({
              url,
              method,
              data,
              baseURL,
              withCredentials: true,
              headers: {
                ...(isNil(headers) ? {} : headers),
              },
            });
          }
        } catch (errToken) {
          if (axios.isAxiosError(errToken)) {
            /*
             * If token request is felt, check is error is invalid token (401), if true, then trigger logout
             */
            if (
              errToken?.response &&
              equals(
                errToken?.response?.status,
                APIErrorsResponse.invalid_token,
              )
            ) {
              await handleApplicationLogout();
            }
          }
        }
      }
    }
    /*
     * If first request is felt, but it's not 401, then just throw response, to continue handling flow inside thunks
     */
    throw err;
  }
};

async function requestNewTokens(refresh_token: string | null) {
  if (refreshTokenRequest.promise === null) {
    refreshTokenRequest.promise = axios.post<GetUserTokenResponseDTO>(
      "token",
      {
        refresh_token,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  }
  const { data: refreshData } = await refreshTokenRequest.promise;
  refreshTokenRequest.access_token = refreshData.access_token;
}

const handleApplicationLogout = async () => {};

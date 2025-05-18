export interface IRequester {
  url: string;
  method: Http_Methods;
  data?: unknown;
  headers?: { [key: string]: string };
}

export type Http_Methods =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "OPTION"
  | "PATCH";


  export enum APIErrorsResponse {
    invalid_token = 401,
    inactivate_user = 403,
    not_found = 404,
    server_error = 500,
  }
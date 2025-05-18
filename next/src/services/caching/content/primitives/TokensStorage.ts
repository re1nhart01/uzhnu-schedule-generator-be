import { defaultTo, isNil } from "ramda";

import { AsyncStorageCache } from "./AsyncStorageCache";

export const AUTH_KEY = "AUTHORIZE_DATA";

export type tokenTemplate = {
  access_token: string | null;
  refresh_token: string | null;
  expires_in: number | null;
};

const emptyTemplate = {
  access_token: null,
  refresh_token: null,
  expires_in: 0,
};

export class TokensStorage extends AsyncStorageCache {
  private _currentState: tokenTemplate;
  constructor() {
    super();
    this._currentState = {
      access_token: "",
      refresh_token: "",
      expires_in: 0,
    };
  }

  public async getAndSetTokenData(
    tokenData: tokenTemplate
  ): Promise<tokenTemplate> {
    await this.save(tokenData);
    return await this.take();
  }

  public async destroy() {
    await this.removeItem(AUTH_KEY);
    this._currentState = {
      access_token: "",
      refresh_token: "",
      expires_in: 0,
    };
  }

  public get currentState(): tokenTemplate {
    return this._currentState;
  }

  public async init(): Promise<void> {
    await this.take();
  }

  public async save(data: tokenTemplate) {
    await this.addItem(
      AUTH_KEY,
      JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: defaultTo(86400, data.expires_in),
      })
    );
    this._currentState = data;
  }

  public async take() {
    const tokenStorageData: string | null = await this.getItem(AUTH_KEY);
    if (isNil(tokenStorageData)) {
      return emptyTemplate;
    }
    const data = JSON.parse(tokenStorageData) as tokenTemplate;
    this._currentState = data;
    return data;
  }
}

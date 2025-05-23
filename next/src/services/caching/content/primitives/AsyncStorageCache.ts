import { BaseCacheStorage } from "./BaseCacheStorage";

const MAX_LIMIT = 1000;

export class AsyncStorageCache<
  T extends string = string,
> extends BaseCacheStorage<T, typeof localStorage, string> {
  constructor() {
    if (typeof window === "undefined") {
      throw new Error("AsyncStorageCache can only be used in the browser");
    }
    super(MAX_LIMIT, window.localStorage);
  }

  public override async addItem(key: string, data: string): Promise<void> {
    await this._store.setItem(key, data);
  }

  public override async getItem(key: string): Promise<string | null> {
    return await this._store.getItem(key);
  }

  public async getCachedValue(key: string): Promise<string | number | null> {
    return key;
  }

  public override async removeAll(): Promise<void> {
    await this._store.clear();
  }

  public override async removeItem(key: string): Promise<void> {
    await this._store.removeItem(key);
  }

  public override async updateItem(key: string, data: string): Promise<void> {
    await this.addItem(key, data);
  }

  public async init(): Promise<void> {
    console.log("STUB!");
  }
}

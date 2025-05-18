import { isNil } from "ramda";

import type { ArrayCacheStorage } from "./primitives/ArrayCacheStorage";
import type { AsyncStorageCache } from "./primitives/AsyncStorageCache";
import type { ObjectCacheStorage } from "./primitives/ObjectCacheStorage";

export type AllStorages =
  | ArrayCacheStorage<any>
  | ObjectCacheStorage<string, any>
  | AsyncStorageCache;

export type AcceptableCacheStore = Record<string, AllStorages>;
export type HeadersListOrDetails<T extends string | null> = T extends string
  ? Record<keyof T, Record<string, ModifielHeaders>>
  : Record<keyof T, ModifielHeaders>;

export type ModifielHeaders = {
  "If-Modified-Since": string;
  "If-None-Match": string;
};

type ClusterConfig<T = AcceptableCacheStore> = {
  allow: Array<keyof T>;
  mergeStrategy?: "mergeDeep" | "mergeShallow" | "overwrite";
  persistenceName: string;
  timestampsName: string | undefined;
  headersName: string;
};

export interface PersistStorage {
  getString: (key: string) => any | Promise<any>;
  set: (key: string, data: any) => void | Promise<void>;
  delete: (key: string) => void | Promise<void>;
}

export const NONE_TIMESTAMP = 8640000000000;

export class CacheCluster<T extends AcceptableCacheStore> {
  private readonly _cluster: T;
  private readonly _config: ClusterConfig<T>;
  private readonly _storage: PersistStorage;
  private _stamps: Record<keyof T, string>;
  private _modifiedHeaders: Record<
    keyof T,
    Record<string, ModifielHeaders> | ModifielHeaders
  >;
  constructor({
    cluster,
    config,
    storage,
  }: {
    cluster: T;
    config: ClusterConfig<T>;
    storage: PersistStorage;
  }) {
    this._cluster = cluster;
    this._config = config;
    this._storage = storage;
    this._stamps = this.generateStamps();
    this._modifiedHeaders = this.generateHeaders();
  }

  private readonly generateHeaders = () =>
    Object.keys(this._cluster as AcceptableCacheStore).reduce(
      (accumulator, currentValue) => ({
        ...accumulator,
        [currentValue]: {},
      }),
      {} as Record<keyof T, Record<string, ModifielHeaders>>
    );

  private readonly generateStamps = () =>
    Object.keys(this._cluster as AcceptableCacheStore).reduce(
      (accumulator, currentValue) => ({
        ...accumulator,
        [currentValue]: new Date().toISOString(),
      }),
      {} as Record<keyof T, string>
    );

  public async asyncPersist() {
    setTimeout(() => {
      this.persist();
    }, 100);
  }

  public persist() {
    const persistPaths: Record<string, unknown> = {};
    for (const i of this._config.allow) {
      if (this._cluster && this._cluster[i]) {
        persistPaths[i as string] = this._cluster[i]?.getAll?.();
      }
    }

    if (this._config.headersName) {
      this._storage.set(
        this._config.headersName,
        JSON.stringify(this._modifiedHeaders)
      );
    }

    if (this._config.timestampsName) {
      this._storage.set(
        this._config.timestampsName,
        JSON.stringify(this._stamps)
      );
    }

    this._storage.set(
      this._config.persistenceName,
      JSON.stringify(persistPaths)
    );
  }

  public restore() {
    const jsonData = this._storage.getString(this._config.persistenceName);
    if (isNil(jsonData)) {
      return;
    }

    const data: Record<string, never> = JSON.parse(jsonData);

    if (this._config.timestampsName) {
      const persistStamps = this._storage.getString(
        this._config.timestampsName
      );
      if (persistStamps) this._stamps = JSON.parse(persistStamps);
    }

    if (this._config.headersName) {
      const persistHeaders = this._storage.getString(this._config.headersName);
      if (persistHeaders) this._modifiedHeaders = JSON.parse(persistHeaders);
    }

    for (const path in data) {
      this._cluster[path as keyof T]?.setAll?.(data[path]);
    }
  }

  private compareDates(stamp: string, otherStamp = new Date().toISOString()) {
    const date1 = new Date(stamp);
    const date2 = new Date(otherStamp);
    return date1.getTime() < date2.getTime();
  }

  public get<D extends keyof T>(k: D): [T[D], boolean] {
    const isNeedToReloadData = this.compareDates(this._stamps[k]);
    return [this._cluster[k], isNeedToReloadData];
  }

  public updateHeaders<D extends keyof T>(
    path: D,
    allHeaders: Record<string, any>,
    page: string | null = null
  ) {
    setTimeout(() => {
      const ifModifiedSince: string =
        allHeaders["If-Modified-Since"] ?? new Date().toISOString();
      const ifNoneMatch: string = allHeaders.etag ?? "---";

      if (isNil(page)) {
        this._modifiedHeaders[path] = {
          "If-Modified-Since": ifModifiedSince ?? null,
          "If-None-Match": ifNoneMatch ?? null,
        };
      } else {
        this._modifiedHeaders[path] = {
          ...this._modifiedHeaders[path],
          [page]: {
            "If-Modified-Since": ifModifiedSince ?? null,
            "If-None-Match": ifNoneMatch ?? null,
          },
        };
      }

      this.persist();
    }, 1000);

    return this;
  }

  public getModifiedHeader<D extends keyof T>(
    path: D,
    page: string | undefined,
    additionalHeaders = {}
  ) {
    if (isNil(page)) return this._modifiedHeaders[path];

    const headerPath = this._modifiedHeaders[path] as Record<
      keyof T,
      Record<string, ModifielHeaders>
    >;

    return {
      ...(headerPath[page] ?? {
        "If-Modified-Since": "---",
        "If-None-Match": "---",
      }),
      ...additionalHeaders,
    };
  }

  public updateTime<D extends keyof T>(path: D) {
    const cachePath = this._cluster[path];
    const ttl = cachePath.config.TTL;
    this._stamps[path] = new Date(Date.now() + ttl).toISOString();
    return this;
  }

  public clear() {
    for (const path in this._cluster) {
      this._cluster[path].removeAll?.();
      this._storage.delete(this._config.persistenceName);
      this._config.timestampsName &&
        this._storage.delete(this._config.timestampsName);
    }
  }

  public get stamps(): Record<string, string> {
    return this._stamps;
  }
}

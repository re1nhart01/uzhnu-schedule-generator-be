import { defaultTo, isNil } from "ramda";

import type { CacheStorageConfig, Primitive } from "./BaseCacheStorage";
import { BaseCacheStorage } from "./BaseCacheStorage";
import { isPrimitive } from "@/helpers/functions";

const MAX_LIMIT = 1000;

export class ObjectCacheStorage<Key, Data> extends BaseCacheStorage<
  Key,
  Map<Key, Data>,
  Data
> {
  constructor({
    config,
    limit,
  }: {
    config?: CacheStorageConfig;
    limit?: number;
  }) {
    super(limit || MAX_LIMIT, new Map<Key, Data>(), config);
  }
  public override addItem(key: Key, data: Data): void {
    if (this._store.size >= this.limit) {
      this._store.clear();
    }
    this._store.delete(key);
    this._store.set(key, data);
  }

  public override updateItem(key: Key, data: Data): void {
    if (this._store.has(key)) {
      this._store.set(key, data);
    } else {
      this.addItem(key, data);
    }
  }

  public override removeAll(): void {
    this._store = new Map<Key, Data>();
  }

  public override assign<K extends string | number | symbol>(data: {
    [key in K]: Data;
  }): void {
    const newData = this.merge(Object.fromEntries(this._store.entries()), data);
    this._store = newData;
  }

  private merge<T>(a: T, b: Partial<T>): T {
    if (isNil(a)) return b as T;
    if (isNil(b)) return a as T;
    return Array.isArray(a) && Array.isArray(b)
      ? ([...a, ...b] as T)
      : ({ ...a, ...b } as T);
  }

  public override updateItemChunk(
    key: Key,
    data: Data extends Primitive ? Data : Partial<Data>
  ): void {
    const item = this.getItem(key);
    if (item) {
      const isPrimitiveValue = isPrimitive(data);
      if (isPrimitiveValue) {
        this._store.set(key, data as Data);
      } else {
        this._store.set(key, this.merge(item, data as Partial<Data>));
      }
    } else {
      this._store.set(key, data as Data);
    }
  }

  public override getItem(key: Key): Data | null {
    return defaultTo(null, this._store.get(key));
  }
  public override removeItem(key: Key): void {
    if (this._store.has(key)) {
      this._store.delete(key);
    }
  }

  public override find(f: (item: Data) => boolean): {
    index: string | number;
    item: Data;
  } | null {
    let result = null;
    this._store.forEach((i, k) => {
      if (f(i)) {
        result = { index: k, item: i };
        return;
      }
    });

    return result;
  }

  public override getAll(): { [key: string]: Data } {
    return Object.fromEntries(this._store.entries());
  }

  public override setAll(data: Record<string, Data>) {
    for (const property in data) {
      this._store.set(property as Key, data[property]);
    }
  }
}
